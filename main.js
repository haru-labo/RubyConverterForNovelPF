/**
 * @classdesc 本ツールのメイン処理です。
 */
'use strict';

//入力・変換タイプの選択肢のValue値
const TYPE_NAROU = 'Narou';
const TYPE_KAKUYOMU = 'Kakuyomu';
const TYPE_ALPHA = 'Alpha';
const TYPE_PIXIV = 'Pixiv'
//サイトごとのルビ記号の正規表現オブジェクト
const REGEX_RUBY_NAROU = new RegExp('[\\|｜].+?[《\\(（].+?[》\\)）]', 'gm');
const REGEX_RUBY_KAKUYOMU = new RegExp('[\\|｜].+?《.+?》', 'gm');
const REGEX_RUBY_ALPHA = new RegExp('#.+?__.+?__#', 'gm');
const REGEX_RUBY_PIXIV = new RegExp('\\[\\[rb:.+? > .+?\\]\\]', 'gm');
//サイトごとの傍点記法の正規表現オブジェクト
const REGEX_DOTS_NAROU = new RegExp('[\\|｜][^\\|｜]+?《・+?》', 'gm');
const REGEX_DOTS_KAKUYOMU = new RegExp('《《.+?》》', 'gm');
const REGEX_DOTS_ALPHA = new RegExp('#[^#]+?__・+?__#', 'gm');
const REGEX_DOTS_PIXIV = new RegExp('\\[\\[rb:[^(\\[\\[rb:)]+? > ・+?\\]\\]', 'gm');
//漢字とルビの配列インデックス番号
const KANJI = 0;
const RUBY = 1;

/**
 * 変換前のテキストエリアの文字列のルビ記号部分と傍点記号を置換し、
 * 変換後テキストエリアに反映する処理です。
 */
const convert = () => {
    const inputType = document.getElementById('inputType').value;
    const convType = document.getElementById('conversionType').value;
    let targetStr = document.getElementById('beforeText').value;
    if (inputType != convType) {
        // 傍点記法を変換
        if (dotsRegex(inputType).test(targetStr)) {
            targetStr = repStrDots(inputType, convType, targetStr);
        }
        // ルビ記法を変換
        if (rubyRegex(inputType).test(targetStr)) {
            targetStr = repStrRuby(inputType, convType, targetStr);
        } 
    }
    document.getElementById('afterText').value = targetStr
};

/**
 * 変換前形式の傍点記号を変換後形式の傍点記号に置換する処理です。
 * @param {String} inputType 変換前形式（小説投稿サイト）
 * @param {String} convType 変換後形式（小説投稿サイト）
 * @param {String} str 変換対象文字列
 * @return {String} 変換後の文字列
 */
 const repStrDots = (inputType, convType, str) => {
    let result = str;
    str.match(dotsRegex(inputType)).forEach(element => {
        let convStr;
        let dotsStr = extractDotsStr(inputType, element);
        switch(convType) {
            case TYPE_NAROU : 
                convStr = dotsStr.split('').map(value => '|' + value + '《・》').join('');
                break;
            case TYPE_KAKUYOMU :
                convStr = '《《' + dotsStr + '》》';
                break;
            case TYPE_ALPHA :
                convStr = '#' + dotsStr + '__' + '・'.repeat(dotsStr.length) + '__#';
                break;
            case TYPE_PIXIV :
                convStr = '[[rb:' + dotsStr + ' > ' + '・'.repeat(dotsStr.length) + ']]'; 
                break;
            default :
                convStr = null;
                break;
        }
        result = result.replace(element, convStr);
    });
    return result;
};

/**
 * 入力された文字列の傍点記号の対象となる文字列を返します。
 * @param {String} inputType 読み込み形式（小説投稿サイト）
 * @param {String} str 処理対象の対象文字列
 * @return {String} 傍点対象の文字列
 */
 const extractDotsStr = (inputType, str) => {
    let result;
    switch(inputType) {
        case TYPE_NAROU : 
            result = str.replace(/\||｜|《|》|・/g, '');
            break;
        case TYPE_KAKUYOMU : 
            result = str.replace(/《《|》》/g, '');
            break;
        case TYPE_ALPHA :
            result = str.replace(/^#|__・+?__#/g, '');
            break;
        case TYPE_PIXIV :
            result = str.replace(/^(\[\[rb:)|( > ・+?\]\])$/g, '');
            break;
        default :
            result = null;
            break;
    }
    return result;  
};

/**
 * 変換前形式のルビ記号を変換後形式のルビ記号に置換する処理です。
 * @param {String} inputType 変換前形式（小説投稿サイト）
 * @param {String} convType 変換後形式（小説投稿サイト）
 * @param {String} str 変換対象文字列
 * @return {String} 変換後の文字列
 */
const repStrRuby = (inputType, convType, str) => {
    let result = str;
    str.match(rubyRegex(inputType)).forEach(element => {
        let convStr;
        let orgKanjiAndRuby = kanjiAndRuby(inputType, element);
        switch(convType) {
            case TYPE_NAROU : 
            case TYPE_KAKUYOMU :
                convStr = '|' + orgKanjiAndRuby[KANJI] + '《' + orgKanjiAndRuby[RUBY] + '》';
                break;
            case TYPE_ALPHA :
                convStr = '#' + orgKanjiAndRuby[KANJI] + '__' + orgKanjiAndRuby[RUBY] + '__#';
                break;
            case TYPE_PIXIV :
                convStr = '[[rb:' + orgKanjiAndRuby[KANJI] + ' > ' + orgKanjiAndRuby[RUBY] + ']]'; 
                break;
            default :
                convStr = null;
                break;
        }
        result = result.replace(element, convStr);
    });
    return result;
};

/**
 * 小説投稿サイトごとの傍点記号部分の正規表現を返します。
 * @param {String} inputType 形式（小説投稿サイト）
 * @return {RegExp} 形式で指定された小説投稿サイトの傍点記号部分の正規表現オブジェクト
 */
 const dotsRegex = inputOrConvType => {
    let pattern;
    switch(inputOrConvType) {
        case TYPE_NAROU : 
            pattern = REGEX_DOTS_NAROU;
            break;
        case TYPE_KAKUYOMU : 
            pattern = REGEX_DOTS_KAKUYOMU;
            break;
        case TYPE_ALPHA :
            pattern = REGEX_DOTS_ALPHA;
            break;
        case TYPE_PIXIV :
            pattern = REGEX_DOTS_PIXIV;
            break;
        default :
            pattern = null;
            break;
    }
    return pattern;
};

/**
 * 文字列のルビ記号部分を漢字とルビに分けて返します。
 * @param {String} inputType 読み込み形式（小説投稿サイト）
 * @param {String} str 分割対象文字列
 * @return {String[]} 分割後の文字列配列[漢字,ルビ]
 */
const kanjiAndRuby = (inputType, str) => {
    let result;
    switch(inputType) {
        case TYPE_NAROU : 
            result = str.replace(/\||｜|》|\)|）/g, '').split(/《|\(|（/);
            break;
        case TYPE_KAKUYOMU : 
            result = str.replace(/\||｜|》/g, '').split('《');
            break;
        case TYPE_ALPHA :
            result = str.replace(/^#|__#/g, '').split('__');
            break;
        case TYPE_PIXIV :
            result = str.replace(/^(\[\[rb:)|(\]\])$/g, '').split(' > ');
            break;
        default :
            result = null;
            break;
    }
    return result;  
};

/**
 * 小説投稿サイトごとのルビ記号部分の正規表現を返します。
 * @param {String} inputType 形式（小説投稿サイト）
 * @return {RegExp} 形式で指定された小説投稿サイトのルビ記号部分の正規表現オブジェクト
 */
const rubyRegex = inputOrConvType => {
    let pattern;
    switch(inputOrConvType) {
        case TYPE_NAROU : 
            pattern = REGEX_RUBY_NAROU;
            break;
        case TYPE_KAKUYOMU : 
            pattern = REGEX_RUBY_KAKUYOMU;
            break;
        case TYPE_ALPHA :
            pattern = REGEX_RUBY_ALPHA;
            break;
        case TYPE_PIXIV :
            pattern = REGEX_RUBY_PIXIV;
            break;
        default :
            pattern = null;
            break;
    }
    return pattern;
};

/**
 * 変換後テキストボックスに入力されている文字列をコピーする処理です。
 */
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

/**
 * 変換後テキストボックスに入力されている文字列をテキストファイルとしてダウンロードする処理です。
 * ファイル名形式：変換後形式の小説サイト名_現在日付時刻.txt
 */
const downloadAfterText = () => {
    const blob = new Blob([document.getElementById('afterText').value], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = selectedConvTypeText() + '_' + nowDateTime() + '.txt';
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

/**
 * 変換後形式のドロップダウンボックスで選択されている
 * 変換形式（小説投稿サイト名）を返します。
 * @return {String} 選択されている小説投稿サイト名
 */
const selectedConvTypeText = () => {
    const obj = document.getElementById('conversionType');
    const idx = obj.selectedIndex;
    return obj.options[idx].text;
};

/**
 * 現在の日付・時刻を結合した文字列を返します。
 * 月・日・時・分・秒は2ケタ0埋めです。
 * @return {String} 現在の日付・時刻を結合した文字列
 */
const nowDateTime = () => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return year + month + date + hours + minutes + seconds;
};

/**
 * 使い方画面のモーダルウィンドウを開く処理です。
 */
const openHowToUse = () => {
    document.getElementById('modalHowToUse').classList.add('is-active');
};

/**
 * 使い方画面のモーダルウィンドウを閉じる処理です。
 */
const closeHowToUse = () => {
    document.getElementById('modalHowToUse').classList.remove('is-active');    
};

/**
 * 初期化処理です。
 * DOM読み込み時に各イベントリスナーを登録します。
 */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('howToUse').addEventListener('click', openHowToUse);
    document.getElementById('closeHowToUse').addEventListener('click', closeHowToUse);
    document.getElementById('inputType').addEventListener('change', convert);
    document.getElementById('conversionType').addEventListener('change', convert);
    document.getElementById('beforeText').addEventListener('change', convert);
    document.getElementById('afterText').addEventListener('dblclick', copyAfterText);
    document.getElementById('copyText').addEventListener('click', copyAfterText);
    document.getElementById('downloadText').addEventListener('click', downloadAfterText);
});