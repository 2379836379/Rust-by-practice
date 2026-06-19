var initAll = function () {
    var path = window.location.pathname;
    if (path.endsWith("/print.html")) {
        return;
    }

    var initEditorPersistence = function () {
        if (!window.localStorage) {
            return;
        }

        var editors = window.editors || [];
        if (!editors.length) {
            return;
        }

        var storagePrefix = "rust-by-practice:answers:";

        Array.prototype.forEach.call(editors, function (editor, index) {
            var key = storagePrefix + path + "#" + index;
            var saved = localStorage.getItem(key);
            if (saved !== null && saved !== editor.getValue()) {
                editor.setValue(saved, -1);
                editor.clearSelection();
            }

            editor.getSession().on("change", function () {
                localStorage.setItem(key, editor.getValue());
            });
        });
    };

    window.setTimeout(initEditorPersistence, 0);

    var images = document.querySelectorAll("main img")
    Array.prototype.forEach.call(images, function (img) {
        img.addEventListener("click", function () {
            BigPicture({
                el: img,
            });
        });
    });

    var pagetoc = document.getElementsByClassName("pagetoc")[0];
    var pagetocLinks = pagetoc ? pagetoc.children : [];

    // Un-active everything when you click it
    Array.prototype.forEach.call(pagetocLinks, function (el) {
        el.addEventListener("click", function () {
            Array.prototype.forEach.call(pagetocLinks, function (link) {
                link.classList.remove("active");
            });
            el.classList.add("active");
        });
    });

    var updateFunction = function () {
        var id = null;
        var elements = document.getElementsByClassName("header");
        Array.prototype.forEach.call(elements, function (el) {
            if (window.pageYOffset >= el.offsetTop) {
                id = el;
            }
        });

        Array.prototype.forEach.call(pagetocLinks, function (el) {
            el.classList.remove("active");
        });

        Array.prototype.forEach.call(pagetocLinks, function (el) {
            if (id == null) {
                return;
            }
            if (id.href.localeCompare(el.href) == 0) {
                el.classList.add("active");
            }
        });
    };

    var elements = document.getElementsByClassName("header");
    if (pagetoc) {
        Array.prototype.forEach.call(elements, function (el) {
            var link = document.createElement("a");

            // Indent shows hierarchy
            var indent = "";
            switch (el.parentElement.tagName) {
                case "H1":
                    return;
                case "H3":
                    indent = "20px";
                    break;
                case "H4":
                    indent = "40px";
                    break;
                default:
                    break;
            }

            link.appendChild(document.createTextNode(el.text));
            link.style.paddingLeft = indent;
            link.href = el.href;
            pagetoc.appendChild(link);
        });
        updateFunction.call();

        // Handle active elements on scroll
        window.addEventListener("scroll", updateFunction);
    }

    var themeList = document.getElementById("mdbook-theme-list") || document.getElementById("theme-list");
    if (themeList) {
        themeList.addEventListener("click", function (e) {
            var iframe = document.querySelector('.giscus-frame');
            if (!iframe) return;
            var themeButton = e.target.closest ? e.target.closest(".theme") : null;
            if (!themeButton) {
                return;
            }

            var theme = themeButton.id.replace("mdbook-theme-", "");

            // 若当前 mdbook 主题不是 Light 或 Rust ，则将 giscuz 主题设置为 transparent_dark
            var giscusTheme = "light";
            if (theme !== "light" && theme !== "rust" && theme !== "default_theme") {
                giscusTheme = "transparent_dark";
            }

            var msg = {
                setConfig: {
                    theme: giscusTheme
                }
            };
            iframe.contentWindow.postMessage({ giscus: msg }, 'https://giscus.app');
        });
    }
    
    var pagePath = path;
    if (pagePath.length > 1 && pagePath.charAt(pagePath.length - 1) === "/") {
        pagePath = pagePath.substring(0, pagePath.length - 1);
    }
    if (pagePath === "" || pagePath === "/") {
        pagePath = "index";
    }
    pagePath = pagePath.replace(/^\//, "");
    pagePath = pagePath.replace(/\.html$/, "");
    if (pagePath === "") {
        pagePath = "index";
    }

    // add visitors count
    var isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    var ele = document.createElement("div");
    ele.setAttribute("align","center");
    var divider =document.createElement("hr")

    if (!isLocalhost) {
        var badgePath = path.replace(/^\/+/, "").replace(/\.html$/, "");
        var count = document.createElement("img")
        // count.setAttribute("src", "https://visitor-badge.glitch.me/badge?page_id=practice/en/" + badgePath);
        count.setAttribute("src", "https://api.visitorbadge.io/api/visitors?labelColor=%23595959&countColor=%230d81c3&style=flat-square&path=practice/en/" + badgePath);
        ele.appendChild(count);
    }

    var giscusContainer = document.getElementById("giscus-container");
    if (!giscusContainer) {
        giscusContainer = document.createElement("div");
        giscusContainer.id = "giscus-container";
        var main = document.querySelector("main");
        if (main) {
            main.appendChild(giscusContainer);
        } else {
            return;
        }
    }

    giscusContainer.appendChild(ele);
    giscusContainer.appendChild(divider);
    
    // 选取浏览器默认使用的语言
    const lang = navigator.language || navigator.userLanguage

    // 若当前 mdbook 主题为 Light 或 Rust ，则将 giscuz 主题设置为 light
    var theme = "transparent_dark";
    const themeClass = document.getElementsByTagName("html")[0].className;
    if (themeClass.indexOf("light") != -1 || themeClass.indexOf("rust") != -1) {
        theme = "light"
    }

    var script = document.createElement("script")
    script.type = "text/javascript";
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", "sunface/rust-by-practice");
    script.setAttribute("data-repo-id", "MDEwOlJlcG9zaXRvcnkxMjk5OTAzOTY=");
    script.setAttribute("data-category", "Book Comments");
    script.setAttribute("data-category-id", "DIC_kwDOB79-_M4COQmx");
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", pagePath);
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", lang == 'en-US' ? 'en' : lang);
    // 预先加载评论会更好，这样用户读到那边时，评论就加载好了
    // script.setAttribute("data-loading", "lazy");
    giscusContainer.appendChild(script);
};

window.addEventListener('load', initAll);
