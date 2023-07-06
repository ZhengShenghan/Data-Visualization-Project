/**
 * @name: rem
 * @date: 2023/5/5 11:02
 * @description：rem
 * @update: 2023/5/5 11:02
 */
(function () {
    function refreshRem() {
        const designSize = 1920; // 设计图尺寸
        const html = document.documentElement;
        const wW = html.clientWidth; // 窗口宽度
        const rem = (wW * 100) / designSize;

        document.documentElement.style.fontSize = rem + "px";
    }

    window.onresize = function () {
        refreshRem();
    };

    refreshRem();
})(window);



