'use strict';

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
    document.getElementById('afterText').addEventListener('dblclick', copyAfterText);
});