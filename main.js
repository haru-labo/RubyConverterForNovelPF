'use strict';
//入力・変換タイプの選択肢のValue値
const TYPE_NAROU = 'Narou';
const TYPE_ALPHA = 'Alpha'
//サイトごとのルビ記号の正規表現オブジェクト
const REGEX_RUBY_NAROU = new RegExp(/\|.*《.*》/, 'gm');
const REGEX_RUBY_ALPHA = new RegExp(/#.*__.*__#/, 'gm');
//漢字とルビのインデックス
const KANJI = 0;
const RUBY = 1;

//変換処理
const convert = () => {
    const beforeText = document.getElementById('beforeText').value;
    const inputType = document.getElementById('inputType').value;
    const convType = document.getElementById('conversionType').value;
    if (rubyRegex(inputType).test(beforeText)) {
        document.getElementById('afterText').value = repStr(inputType, convType, beforeText);
    } else {
        document.getElementById('afterText').value = beforeText
    }
};

//元テキストを置換
const repStr = (inputType, convType, str) => {
    let result = str;
    str.match(rubyRegex(inputType)).forEach(element => {
        let convStr;
        let orgKanjiAndRuby = kanjiAndRuby(inputType, element);
        switch(convType) {
            case TYPE_NAROU : 
                convStr = '|' + orgKanjiAndRuby[KANJI] + '《' + orgKanjiAndRuby[RUBY] + '》';
                break;
            case TYPE_ALPHA :
                convStr = '#' + orgKanjiAndRuby[KANJI] + '__' + orgKanjiAndRuby[RUBY] + '__#';
                break;
            default :
                convStr = null;
                break;
        }
        result = result.replace(element, convStr);
    });
    return result;
};

//変換前の漢字とルビを配列で返す
const kanjiAndRuby = (inputType, str) => {
    let result;
    switch(inputType) {
        case TYPE_NAROU : 
            result = str.replace(/\||》/g, '').split('《');
            break;
        case TYPE_ALPHA :
            result = str.replace(/^#|__#/g, '').split('__');
            break;
        default :
            result = null;
            break;
    }
    return result;  
};

//サイトに応じたルビ記法の正規表現オブジェクトを返す
const rubyRegex = inputOrConvType => {
    let pattern;
    switch(inputOrConvType) {
        case TYPE_NAROU : 
            pattern = REGEX_RUBY_NAROU;
            break;
        case TYPE_ALPHA :
            pattern = REGEX_RUBY_ALPHA;
            break;
        default :
            pattern = null;
            break;
    }
    return pattern;
};

//変換後のテキストをコピー
const copyAfterText = () => {
    const text = document.getElementById('afterText').value;
    navigator.clipboard.writeText(text)
        .then(
            success => iziToast.success({ 
                title: 'コピー成功',
                message: 'クリップボードにコピーしました'
            }),
            error => iziToast.error({ 
                title: 'コピー失敗',
                message: 'クリップボードへのコピーに失敗しました'
            }),
        );
};

//DOMツリー構成で実行（初期化処理）
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('inputType').addEventListener('change', convert);
    document.getElementById('conversionType').addEventListener('change', convert);
    document.getElementById('beforeText').addEventListener('change', convert);
    document.getElementById('afterText').addEventListener('dblclick', copyAfterText);
    document.getElementById('copyText').addEventListener('click', copyAfterText);
});