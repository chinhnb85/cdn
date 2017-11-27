//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\config\env\config.development.js
this["IMS"] = this["IMS"] || {};
this["IMS"]["Config"] = {"socketIO":false,"staticUrl":"http://192.168.60.95:1166/","mode":"development","version":"1.4.32","usingCDN":true};
//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\config\env\index.js
window.IMS=window.IMS||{};window.IMS.Config = window.IMS.Config || {};window.IMS.Config.baseUrl =(function(){ var $src = document.querySelector('[src*="dist/mobile/plugins/photo-manager.js"]'); var parser = document.createElement('a'); parser.href = $src.getAttribute('src'); return parser.protocol + '//' + parser.host + '/'; })();window.IMS.Config.baseAjaxUrl='http://192.168.60.95:1166/';window.IMS.ConfigPlugins = window.IMS.ConfigPlugins || {};window.IMS.ConfigPlugins['photo-manager'] = window.IMS.ConfigPlugins['photo-manager'] || {};window.IMS.ConfigPlugins['photo-manager'].baseUrl =(function(){ var $src = document.querySelector('[src*="dist/mobile/plugins/photo-manager.js"]'); var parser = document.createElement('a'); parser.href = $src.getAttribute('src'); return parser.protocol + '//' + parser.host + '/'; })();window.IMS.ConfigPlugins['photo-manager'].baseAjaxUrl='http://192.168.60.95:1166/';
//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\src\core\client\common\IMS.Actions.js
/*###############################################*/
/*  chuyển đổi từ cms.js
 /*  2/2/2016
 /*###############################################*/

(function (Actions) {
    window.IMS = window.IMS || {};
    window.IMS.Actions = Actions();
})(function () {
    var IMS = window.IMS || {};
    
    var Actions = {
        ManagerModule: null,
        ResourceManager: null,
        Constant: null,
        CurrentMenu: "Menu_Unknow",
        StaticCache: {},
        requestTimeout: 100000,

        LogType: {
            Log: 0,
            Error: 1,
            Info: 2,
            Warn: 3,
            Debug: 4,
            Alert: 5
        },

        LoadCss: function (url, callback) {
            var self = this;
            var cssList = [];

            if (Array.isArray(url)) {
                cssList = url;
            } else {
                cssList.push(url);
            }
            if (typeof (callback) == "undefined") {
                callback = function () { };
            }

            var linkCount = cssList.length;
            var current = 0;

            for (var i = 0; i < cssList.length; i++) {
                var _url = cssList[i];
                var cssId = IMS.Utils.Base64.encode(_url);

                if (!document.getElementById(cssId)) {
                    var head = document.getElementsByTagName('head')[0];
                    var link = document.createElement('link');

                    link.id = cssId;
                    link.rel = 'stylesheet';
                    link.type = 'text/css';

                    var baseUrl = JSON.parse(JSON.stringify({ baseUrl: IMS.Config.staticUrl })).baseUrl;

                    if (!IMS.Config.usingCDN) {
                        baseUrl = JSON.parse(JSON.stringify({ baseUrl: IMS.Config.baseUrl })).baseUrl;
                    } else {
                        if (typeof (baseUrl) != 'undefined' && _url.startsWith('statics') || _url.startsWith('/statics') || _url.startsWith('/dist')) {
                            baseUrl = JSON.parse(JSON.stringify({ baseUrl: IMS.Config.staticUrl })).baseUrl;
                        } else {
                            baseUrl = JSON.parse(JSON.stringify({ baseUrl: IMS.Config.baseUrl })).baseUrl;
                        }
                    }

                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        _url = baseUrl + _url;
                    }
                    _url = _url + '?v=' + IMS.Config.version;

                    link.href = _url;
                    link.onload = link.onreadystatechange = function () {
                        current++;
                        if (current == linkCount) callback();
                    };
                    link.addEventListener('error', function () {
                        self.Log('load css error: ' + _url, self.LogType.Error);
                        current++;
                        if (current == linkCount) callback();
                    });
                    link.media = 'all';

                    head.appendChild(link);
                } else {
                    current++;
                    if (current == linkCount) callback();
                }
            }

        },

        LoadJs: function (urlObj, callback) {
            var self = this;
            var url = urlObj.url;
            var objectJs = urlObj.objectJs;

            if (typeof (callback) == "undefined") {
                callback = function () { };
            }

            function loadJs(url) {
                //console.log(IMS.Config.baseUrl);
                var jsId = IMS.Utils.Base64.encode(url);

                if (!document.getElementById(jsId)) {
                    var head = document.getElementsByTagName('head')[0];
                    var link = document.createElement('script');

                    link.id = jsId;
                    link.type = 'text/javascript';

                    var baseUrl = JSON.parse(JSON.stringify({ baseUrl: IMS.Config.staticUrl })).baseUrl;

                    if (!IMS.Config.usingCDN) {
                        baseUrl = JSON.parse(JSON.stringify({ baseUrl: IMS.Config.baseUrl })).baseUrl;
                    } else {
                        if (typeof (baseUrl) != 'undefined' && url.startsWith('statics') || url.startsWith('/statics') || url.startsWith('/dist')) {
                            baseUrl = JSON.parse(JSON.stringify({ baseUrl: IMS.Config.staticUrl })).baseUrl;
                        } else {
                            baseUrl = JSON.parse(JSON.stringify({ baseUrl: IMS.Config.baseUrl })).baseUrl;
                        }

                    }
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = baseUrl + url;
                    }
                    url = url + '?v=' + IMS.Config.version;

                    link.src = url;
                    link.onload = link.onreadystatechange = function () {
                        callback();
                    };
                    link.addEventListener('error', function () {
                        callback();
                    });

                    head.appendChild(link);
                } else {
                    callback();
                }
            }

            if (typeof window[objectJs] == 'undefined' && eval("typeof " + objectJs + " == 'undefined'")) {
                // console.log('load: ' + objectJs);
                loadJs(url);
            } else {
                // console.log('bỏ qua không load: ' + objectJs);
                callback();
            }
        },

        LoadResource: function (url, callback) {
            var self = this;
            var urlList = [];

            if (Array.isArray(url)) {
                urlList = url.slice();
            } else {
                urlList.push(url);
            }
            if (typeof (callback) == "undefined") {
                callback = function () { };
            }

            var linkCount = urlList.length;
            var current = 0;

            urlList = urlList.reverse();

            function processQueue() {
                if (urlList.length > 0) {
                    var item = urlList.pop();
                    if (typeof item == "string") {
                        self.LoadCss(item, function () {
                            processQueue();
                            current++;
                            if (current == linkCount) callback();
                        });
                    } else {
                        self.LoadJs(item, function () {
                            processQueue();
                            current++;
                            if (current == linkCount) callback();
                        });
                    }
                }
            }

            processQueue();
        },

        Popup: function (op) {
            //objContainer, width, height, title, buttons, autoClose
            if (op.title == undefined) op.title = "";
            if (op.width == undefined) op.width = 500;
            if (op.stack == undefined) op.stack = false;
            if (op.zIndex == undefined) op.zIndex = 9999;
            if (op.height == undefined) op.height = 300;
            if (op.autoClose == undefined) op.autoClose = true;
            if (op.modal == undefined) op.modal = true;
            if (op.draggable == undefined) op.draggable = true;
            if (op.closeOnEscape == undefined) op.closeOnEscape = true;
            if (op.dialogClass == undefined) op.dialogClass = "";
            if (op.onOpen == undefined) op.onOpen = function (e, ui) { };
            if (op.onClose == undefined) op.onClose = function (e, ui) { };
            if (op.objContainer == undefined || op.objContainer == "") {
                op.objContainer = "#cms_bm_block_messagebox";
            }
            if (op.skin == undefined || op.skin == "") {
                op.skin = "default";
            }
            if ($(op.objContainer).length <= 0) {
                $("body").append('<div id="' + op.objContainer.substr(1) + '" style="display:none; overflow-x:hidden; overflow-y:auto;" title="' + op.title + '"></div>');
            } else {
                $(op.objContainer).css({ 'display': 'none', 'overflow-x': 'hidden', 'overflow-y': 'auto' });
                $(op.objContainer).attr("title", op.title);
            }

            if (op.buttons == undefined) op.buttons = {
                "Đóng": function () {
                    $(this).dialog("close");
                }
            };

            $(op.objContainer).dialog({
                zIndex: op.zIndex,
                width: op.width,
                height: op.height,
                resizable: false,
                dialogClass: op.dialogClass,
                modal: op.modal,
                closeOnEscape: op.closeOnEscape,
                draggable: op.draggable,
                buttons: op.buttons,
                stack: op.stack,
                beforeclose: function () {
                    if (!op.autoClose) {
                        var mesgBox = this;
                        Actions.Confirm("Bạn có chắc chắn đóng cửa sổ không?", function () {
                            $(mesgBox).dialog("close");
                        });
                        return false;
                    } else {
                        return true;
                    }
                },
                close: function () {
                    if (op.cb != undefined) {
                        op.cb();

                    }
                    op.onClose();

                    $(this).dialog();
                    $(this).empty();
                    $(this).dialog("destroy");

                },
                open: function () {
                    $(op.objContainer).parents('.ui-dialog').find('.ui-dialog-titlebar').addClass('IMSWidgetFlatPopupTitleBar');
                    $(op.objContainer).parents('.ui-dialog').find('.ui-dialog-buttonpane').addClass('IMSWidgetFlatPopupButtonBar');
                    $(op.objContainer).parents('.ui-dialog').find('.ui-dialog-buttonpane .ui-button').addClass('IMSBtn IMSMedium');
                    $(op.objContainer).parents('.ui-dialog').find('.ui-dialog-buttonset button').addClass('IMSBtn IMSMedium');
                    $(op.objContainer).parents('.ui-dialog').addClass('IMSWidgetFlatPopupBorder');

                    var _index = 0;
                    $.each(op.buttons, function (i, v) {
                        $(op.objContainer).parents('.ui-dialog').find('.ui-dialog-buttonset button:eq(' + _index + ')').html(i);
                        _index++;
                    });

                    op.onOpen();
                }
            });

            $(op.objContainer).dialog('open');

            if (op.noHeader != undefined && op.noHeader) {
                $(op.objContainer).parent().find(".ui-dialog-titlebar").remove();
            }
            if (op.noFooter != undefined && op.noFooter) {
                $(op.objContainer).parent().find(".ui-dialog-buttonpane").remove();
            }
            if (op.HtmlBinding != undefined && typeof (op.HtmlBinding) == 'function') {
                op.HtmlBinding(op.objContainer);
            }
            if (op.autoScroll == undefined) {
                op.autoScroll = true;
            }
            if (op.autoScroll) {
                $(op.objContainer).slimScroll({
                    height: $(op.objContainer).outerHeight(),
                    width: $(op.objContainer).outerWidth()
                });
            }
            if (op.closeOutWay != undefined && op.closeOutWay) {
                $(".ui-widget-overlay").on("click", function () {
                    $('body').removeClass('overflow-hidden');
                    $(op.objContainer).dialog("close");
                });
            }
        },

        Log: function (content, type) {
            if (typeof (cms_client_debug_mode) != "undefined" && parseInt(cms_client_debug_mode) == 1 && typeof (console) != "undefined") {
                if (typeof (type) == "undefined") {
                    type = Actions.LogType.Info;
                }
                if (type == Actions.LogType.Log) {
                    console.log(content);
                } else if (type == Actions.LogType.Info) {
                    console.info(content);
                } else if (type == Actions.LogType.Warn) {
                    console.warn(content);
                } else if (type == Actions.LogType.Error) {
                    console.error(content);
                } else if (type == Actions.LogType.Debug) {
                    console.debug(content);
                } else if (type == Actions.LogType.Alert) {
                    alert(content);
                }
            }
        },

        StartLoadingTimeout: null,

        ShowLoadingOverlay: function (selector) {
            if (typeof selector == "string") {
                selector = selector.replace('#', '');
                selector = document.getElementById(selector);
            }
            if (selector == null || typeof selector == 'undefined') return;

            var o = document.getElementById("IMSLoadingOverlay");
            if (o) o.remove();

            var overlay = document.createElement('div');

            overlay.innerHTML = '<div style="border-radius: 5px; width: 160px; height: 80px; position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; color: rgb(255, 255, 255); text-align: center; box-sizing: border-box; padding-top: 55px; background: url(' + IMS.Config.baseUrl + 'statics/images/video-loading.gif) no-repeat scroll center 15px / auto 40% rgb(30, 30, 30);">Đang tải dữ liệu...</div>';
            overlay.id = "IMSLoadingOverlay";
            overlay.style.position = selector ? 'absolute' : 'fixed';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.height = '100%';
            overlay.style.width = '100%';
            overlay.style.backgroundColor = 'rgba(30, 30, 30, 0.9)';
            overlay.style.zIndex = '999999999999999';

            if (typeof selector != 'undefined')
                selector.appendChild(overlay);
            else
                document.body.appendChild(overlay);
        },

        HideLoadingOverlay: function () {
            var obj = document.getElementById("IMSLoadingOverlay");
            if (obj != null && typeof obj != 'undefined')
                document.getElementById("IMSLoadingOverlay").remove();
        },

        StartLoading: function () {
            function ResizeLoading() {
                $('#IMSLoadingWrapper').css({
                    width: $(window).width(),
                    height: $(window).height()
                });
                $('#IMSLoadingContent').css({
                    'margin': ($(window).height() / 2 - 30) + 'px auto'
                });
            }

            ResizeLoading();

            if ($('#IMSLoadingWrapper').length == 0) {
                var allowClose = false;
                var htmlCode = '<div id="IMSLoadingWrapper"><div id="IMSLoadingContent"><div id="IMSLoading"><div id="IMSLoading_1" class="IMSLoading"> Đ</div><div id="IMSLoading_2" class="IMSLoading"> a</div><div id="IMSLoading_3" class="IMSLoading"> n</div><div id="IMSLoading_4" class="IMSLoading"> g</div><div id="IMSLoading_5" class="IMSLoading"> &nbsp; </div><div id="IMSLoading_6" class="IMSLoading"> t</div><div id="IMSLoading_7" class="IMSLoading"> ả</div><div id="IMSLoading_8" class="IMSLoading"> i</div><div id="IMSLoading_9" class="IMSLoading"> &nbsp; </div><div id="IMSLoading_10" class="IMSLoading"> d</div><div id="IMSLoading_11" class="IMSLoading"> ữ</div><div id="IMSLoading_12" class="IMSLoading"> &nbsp; </div><div id="IMSLoading_13" class="IMSLoading"> l</div><div id="IMSLoading_14" class="IMSLoading"> i</div><div id="IMSLoading_15" class="IMSLoading"> ệ</div><div id="IMSLoading_16" class="IMSLoading"> u</div><div id="IMSLoading_17" class="IMSLoading"> .</div><div id="IMSLoading_18" class="IMSLoading"> .</div><div id="IMSLoading_19" class="IMSLoading"> .</div></div></div></div>';

                Actions.StartLoadingTimeout = setTimeout(function () {
                    $('body').append(htmlCode);
                    if (allowClose) {
                        $('#IMSLoadingWrapper').off('click').on('click', function () {
                            Actions.Popup({
                                title: "Tiến trình đang chạy",
                                height: 200,
                                width: 400,
                                'z-index': 9999999,
                                objContainer: '#IMSProcessEndConfirm',
                                buttons: {
                                    'Tiếp tục chờ': function () {
                                        var $this = $(this);
                                        $this.dialog('close');
                                    },
                                    'Đóng': function () {
                                        Actions.StopLoading();
                                        $(this).dialog('close');
                                    }
                                },
                                HtmlBinding: function (obj) {
                                    var htmlContent = 'Tác vụ đang được thực thi, bạn muốn tiếp tục chờ?';
                                    $(obj).html(htmlContent);
                                }
                            });
                        });
                    }
                    ResizeLoading();
                }, 0);
            }

            $(window).resize(function () {
                ResizeLoading();
            });
        },

        StopLoading: function () {
            clearTimeout(Actions.StartLoadingTimeout);

            $('#IMSLoadingWrapper').fadeOut(function () {
                $('#IMSProcessEndConfirm').dialog('close');
                $(this).remove();
            });
        },

        ShowOverlay: function (htmlContent, cb, closeCb, rightMargin) {
            if (typeof (rightMargin) == "undefined") {
                rightMargin = 0;
            }
            if (typeof (closeCb) == "undefined") {
                closeCb = function () {

                }
            }

            function ResizeOverlay(isWindowsResize) {
                if (!isWindowsResize) {
                    $('#IMSOverlayWrapper').show();
                    $('#IMSOverlayContent').css({
                        width: 0,
                        'margin-right': rightMargin
                    });
                } else {
                    $('#IMSOverlayContent').css({
                        width: 'auto'
                    });
                    $('#IMSOverlayContent').css({
                        'margin-right': 0
                    });
                }

                var ww = $(window).width();
                var wh = $(window).height();

                $('#IMSOverlayWrapper').css({
                    width: ww,
                    height: wh,
                    'z-index': 1000,
                    top: 46,
                    left: 0,
                    background: 'transparent',
                    position: 'fixed'
                });

                $('#IMSOverlayContent').css({ height: wh - 46 });

                $('#IMSOverlayClose').off('click').on('click', function () {
                    if (typeof (Actions) != "undefined" && typeof (Actions.CloseOverlay) != "undefined") {
                        Actions.CloseOverlay(closeCb);
                    } else {
                        if (closeCb != 'undefined' && closeCb != null && typeof closeCb == 'function')
                            closeCb();
                        $('#IMSOverlayContent').animate({ width: 0 }, 500, function () {
                            $(this).empty();
                            $('#IMSOverlayWrapper').hide().removeAttr('style');
                            $('#IMSOverlayContent').hide().removeAttr('style');
                        });
                    }
                });

                if (!isWindowsResize) {
                    if (typeof (htmlContent) != "undefined") {
                        $('#IMSOverlayContent').html(htmlContent);

                        var contentWidth = 0;
                        $('#IMSOverlayContent').show().children().each(function () {
                            contentWidth = contentWidth + $(this).outerWidth(true);
                        });

                        $('#IMSOverlayContent').animate({ width: contentWidth }, 500, function () {
                            if (cb != undefined && cb != null && typeof cb == 'function') {
                                cb();
                            }
                        });
                    } else {
                        if (cb != undefined && cb != null && typeof cb == 'function') {
                            cb();
                        }
                    }
                }
            }

            $(window).off('keyup').on('keyup', function (event) {
                if (event.keyCode == 27) {
                    Actions.CloseOverlay(closeCb);
                }
            });
            $('#IMSOverlayWrapper.ClickOverlayClose').off('click').on('click', function (evt) {
                if ($(evt.target).attr('id') != 'IMSOverlayContent' && $(evt.target).parents('#IMSOverlayContent').length == 0 && $(evt.target).parents('body').length > 0) {
                    Actions.CloseOverlay(closeCb);
                }
            });

            ResizeOverlay(false);

            $(window).resize(function () {
                ResizeOverlay(true);
            });

            return $('#IMSOverlayWrapper');
        },

        CloseOverlay: function (cb, isWaitAnimationEnd) {
            if (typeof (isWaitAnimationEnd) == "undefined") {
                isWaitAnimationEnd = false;
            }
            if (cb != 'undefined' && cb != null && typeof cb == 'function') {
                if (!isWaitAnimationEnd) cb();
            }
            $('#IMSOverlayContent').animate({ width: 0 }, 500, function () {
                $(this).empty();
                $('#IMSOverlayWrapper').hide().removeAttr('style');
                $('#IMSOverlayContent').hide().removeAttr('style');
                if (isWaitAnimationEnd) cb();
            });
        },

        ShowOverlayFull: function (uOpts) {
            Actions.CloseOverlayFull();

            var opts = {
                content: 'Popup chưa có nội dung',
                width: 500,
                height: function () {
                    return $(window).height()
                },
                onOpen: function (obj) { },
                onClose: function () { },
                title: ''
            }

            $.extend(true, opts, uOpts);

            var $temp = $('<div id="IMSFullOverlayWrapper"><div id="IMSFullOverlayInner"><h1 id="IMSFullOverlayTitle">' + opts.title + '<span id="IMSFullOverlayClose"></span></h1><div id="IMSFullOverlayMainContent"><div id="IMSFullOverlayMainContentHtml"></div></div></div></div>');
            var outerH = ((typeof (opts.height) == 'function') ? opts.height() : opts.height);
            var modalH = outerH - 20 - 30; // - (padding + header)

            $('#IMSFullOverlayMainContent', $temp).css({
                width: opts.width,
                height: modalH
            });
            $('#IMSFullOverlayTitle', $temp).css({
                width: opts.width + 20
            });
            $('#IMSFullOverlayClose', $temp).off('click').on('click', function () {
                $(this).parents('#IMSFullOverlayWrapper').slideUp('fast', function () {
                    opts.onClose();
                    $('#IMSFullOverlayWrapper').empty();
                    $('#IMSFullOverlayWrapper').remove();
                });
            });
            $('#IMSFullOverlayMainContentHtml', $temp).html(opts.content);
            $('body').append($temp);
            $('#IMSFullOverlayInner').css({
                'margin-top': (($(window).height() - outerH) / 2) + 'px'
            });

            opts.onOpen('#IMSFullOverlayMainContent');
        },

        CloseOverlayFull: function (cb) {
            $('#IMSFullOverlayWrapper').slideUp(500, function () {
                $(this).empty();
                $(this).remove();
                if (cb != 'undefined' && cb != null && typeof cb == 'function') {
                    cb();
                }
            });
        },

        MessageBox: function (msg, title, cb) {
            if (typeof (title) == "undefined") {
                title = "Thông báo";
            }
            var elementBox = "#cms_bm_block_messagebox";

            if ($(elementBox).length <= 0) {
                $("body").append('<div id="' + elementBox.substr(1) + '" style="display:none;" title="' + title + '"></div>');
            } else {
                $(elementBox).removeAttr("title").attr("title", title);
            }
            $(elementBox).dialog({
                modal: true,
                resizable: false,
                stack: false,
                zIndex: 99999999,
                buttons: {
                    'Đồng ý': function () {
                        $(this).dialog('close');
                        if (cb != undefined && typeof cb == 'function')
                            cb();
                        Actions.HideLoadingOverlay();
                    }
                },
                close: function () {
                    $(elementBox).empty();
                    $(this).dialog("destroy");
                    if (cb != undefined && typeof cb == 'function')
                        cb();
                },
                open: function () {
                    $(elementBox).parents('.ui-dialog').find('.ui-dialog-titlebar').addClass('IMSWidgetFlatPopupTitleBar');
                    $(elementBox).parents('.ui-dialog').find('.ui-dialog-buttonpane').addClass('IMSWidgetFlatPopupButtonBar');
                    $(elementBox).parents('.ui-dialog').find('.ui-dialog-buttonpane .ui-button').addClass('IMSBtn IMSMedium');
                    $(elementBox).parents('.ui-dialog').find('.ui-dialog-buttonset button').addClass('IMSBtn IMSMedium');
                    $(elementBox).parents('.ui-dialog').addClass('IMSWidgetFlatPopupBorder');
                }
            });
            $(elementBox).dialog('open');
            $(elementBox).html(msg);
        },

        Confirm: function (msg, callBack, callBackOnClosing, close, opts) {
            if (typeof (opts) == "undefined") {
                opts = { skin: '' };
            }
            if (typeof (close) == "undefined") {
                close = true;
            }
            var elementBox = "#IMSConfirmContent";

            if ($(elementBox).length <= 0) {
                $("body").append('<div id="' + elementBox.substr(1) + '" style="display:none;" title="Xác nhận"></div>');
            } else
                $(elementBox).removeAttr("title").attr("title", "Xác nhận");
            $(elementBox).dialog({
                modal: true,
                zIndex: 9999,
                resizable: false,
                stack: false,
                buttons: {
                    'Đồng ý': function () {
                        if (close) $(this).dialog('close');
                        if (typeof (callBack) != "undefined") callBack();
                    },
                    'Bỏ qua': function () {
                        $(this).dialog('close');
                        if (typeof (callBackOnClosing) != "undefined") callBackOnClosing();
                    }
                },
                close: function () {
                    // if (typeof (callBackOnClosing) != "undefined") callBackOnClosing();
                    $(elementBox).empty();
                    $(this).dialog("destroy");
                },
                open: function () {
                    $(elementBox).parents('.ui-dialog').find('.ui-dialog-titlebar').addClass('IMSWidgetFlatPopupTitleBar');
                    $(elementBox).parents('.ui-dialog').find('.ui-dialog-buttonpane').addClass('IMSWidgetFlatPopupButtonBar');
                    $(elementBox).parents('.ui-dialog').find('.ui-dialog-buttonpane .ui-button').addClass('IMSBtn IMSMedium');
                    $(elementBox).parents('.ui-dialog').find('.ui-dialog-buttonset button').addClass('IMSBtn IMSMedium');
                    $(elementBox).parents('.ui-dialog').addClass('IMSWidgetFlatPopupBorder');
                }
            });
            $(elementBox).dialog('open');
            $(elementBox).html(msg);
        },

        CurrentToken: '',

        Post: function (op) {
            var self = this;
            var dataPost = {
                "module": op.module,
                "action": op.action
            };

            if (typeof op.params == 'undefined') op.params = {};
            // if (op.params != undefined && typeof (op.params) === 'object') {
            //     op.params.channel = op.params.channel ? op.params.channel : IMS.channel;
            //     op.params.userName = op.params.userName ? op.params.userName : IMS.Current_UserName;
            //     //
            // }
            // op.getTokenFunction = op.getTokenFunction ? op.getTokenFunction : IMS.GetChannelTokenFunction;
            // if (typeof (op.getTokenFunction) == 'undefined') op.getTokenFunction = function (callback) {
            //     callback('');
            // }

            var isShowTimeoutMessage = op.isShowTimeoutMessage ? op.isShowTimeoutMessage : false;
            var isPostObject = op.postObject != undefined ? op.postObject : true;

            if (isPostObject) {
                if (op.params != undefined && typeof (op.params) === 'object')
                    dataPost = $.extend(dataPost, op.params);
            } else {
                if (op.params != undefined)
                    dataPost = $.param(dataPost) + "&" + op.params;
            }

            var url = op.url != undefined && op.url != '' ? op.url : IMS.Config.baseAjaxUrl + 'api/' + (op.ashx == undefined ? "/plugin-request" : op.ashx);

            function doAjax() {
                var keyAbort = $.ajax({
                    type: 'POST',
                    url: url,
                    data: dataPost,
                    xhrFields: {
                        withCredentials: true
                    },
                    crossDomain: true,
                    dataType: "json",
                    success: function (res) {
                        if (res == null || undefined == res) return false;
                        // if (res.error && res.error.code == 401) {
                        //     console.log('token invalid');
                        //     op.getTokenFunction(function (token) {
                        //         self.CurrentToken = token;
                        //         doAjax();
                        //     });
                        //     return false;
                        // }
                        op.success(res);
                    },
                    error: function (x, t, m) {
                        if (op.error != undefined && typeof (op.error) == 'function') {
                            op.error(x);
                        } else if (t === "timeout") {
                            if (isShowTimeoutMessage) {
                                Actions.Confirm("Thời gian xử lý quá lâu, bạn có muốn thử lại không?", function () {
                                    Actions.Post(op);
                                });
                            }
                        } else {

                        }
                    },
                    timeout: op.timeout != undefined ? op.timeout : Actions.requestTimeout
                });
                return;
            }

            doAjax();

            // if (self.CurrentToken == '') {
            //     op.getTokenFunction(function (token) {
            //         self.CurrentToken = token;
            //         doAjax();
            //     });
            // } else {
            //     doAjax();
            // }
        },

        Waiting: function (msg, objContainerBox, title, isClose) {
            if (typeof (objContainerBox) == "undefined" || objContainerBox == "") var objContainerBox = "#cms_bm_block_messagebox";
            if (typeof (msg) == "undefined" || msg == "") var msg = "Hệ thống đang xử lý dữ liệu, xin đợi chút xíu...";
            if (typeof (title) == "undefined" || title == "") var title = "Thông báo";
            if (typeof (isClose) == "undefined") var isClose = true;

            if ($(objContainerBox).length <= 0) {
                $("body").append('<div id="' + objContainerBox.replace('#', '') + '" style="display:none;" title="' + title + '"></div>');
            }

            var buttons = {};
            if (isClose) {
                buttons = {
                    'Đóng': function () {
                        $(objContainerBox).dialog('close');
                        return true;
                    }
                };
            }
            $(objContainerBox).dialog({
                modal: true,
                resizable: false,
                buttons: buttons,
                zIndex: 99999999,
                beforeclose: function () {
                    return isClose;
                },
                close: function () {
                    $(objContainerBox).empty();
                    //$(this).dialog("close");            
                    $(this).dialog().dialog("destroy");
                },
                open: function () {
                    $(objContainerBox).parents('.ui-dialog').find('.ui-dialog-titlebar').addClass('IMSWidgetFlatPopupTitleBar');
                    $(objContainerBox).parents('.ui-dialog').find('.ui-dialog-buttonpane').addClass('IMSWidgetFlatPopupButtonBar');
                    $(objContainerBox).parents('.ui-dialog').find('.ui-dialog-buttonpane .ui-button').addClass('IMSBtn IMSMedium');
                    $(objContainerBox).parents('.ui-dialog').find('.ui-dialog-buttonset button').addClass('IMSBtn IMSMedium');
                    $(objContainerBox).parents('.ui-dialog').addClass('IMSWidgetFlatPopupBorder');
                }
            });
            $(objContainerBox).dialog('open');
            $(objContainerBox).html(msg + '<br /><br /><center><img src="' + IMS.Config.baseUrl + 'statics/images/loading.gif" /></center>');
        },

        ViewJSON: function (data) {
            var self = this;
            function formatJson(inputJson) {
                try {
                    var result = jsonlint.parse(inputJson);
                    if (result) {
                        $('#IMSJsonViewerMsg').html('JSON chuẩn!');
                        $('#IMSJsonViewerMsg').css({
                            color: 'green'
                        });

                        var formattedJson = JSON.stringify(result, null, "  ");

                        $('#IMSJsonViewerSource').val(formattedJson);

                        var lines = $('#IMSJsonViewerSource').val().split('\n');
                        var lineHtml = '';

                        for (var i = 0; i < lines.length; i++) {
                            lineHtml += '<li>' + (i + 1) + '</li>';
                        }
                        //$('#IMSJsonViewerLine').html(lineHtml);
                    }
                } catch (e) {
                    $('#IMSJsonViewerMsg').html(e);
                    $('#IMSJsonViewerMsg').css({
                        color: 'red'
                    });
                }
            }

            self.Popup({
                title: "IMS JSON VIEWER",
                height: $(window).height() - 100,
                width: 760,
                objContainer: '#IMSJsonViewer',

                buttons: {
                    'Format': function () {
                        formatJson($('#IMSJsonViewerSource').val());
                    },
                    'Đóng': function () {
                        $(this).dialog('close');
                    }
                },
                HtmlBinding: function (obj) {
                    var htmlContent = '<div style="font-family:monospace; font-size:13px;"><ul id="IMSJsonViewerLine" style="display:inline-block; width:30px; float:left;"></ul><textarea spellcheck="false" id="IMSJsonViewerSource" style="border:solid 1px #ccc; padding:5px; width:700px;font-family:monospace;"></textarea><pre id="IMSJsonViewerMsg" style="height:70px; padding:5px; overflow:auto; border:solid 1px #ccc; background:#fff; width:700px; margin-top:5px;"></pre></div>';

                    $(obj).html(htmlContent);

                    $('#IMSJsonViewerSource').css({
                        height: $('#IMSJsonViewer').height() - 120
                    });

                    if (typeof (data) == "object" && data != '' && data != null) {
                        var seen = [];
                        data = JSON.stringify(data, function (key, val) {
                            if (val != null && typeof val == "object") {
                                if (seen.indexOf(val) >= 0)
                                    return
                                seen.push(val)
                            }
                            return val
                        });
                    }
                    if (typeof (data) == "string" && data != '') {
                        $('#IMSJsonViewerSource').val(data);
                        formatJson($('#IMSJsonViewerSource').val());
                    }
                }
            });
        }
    };

    return Actions;
});
//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\src\core\client\common\IMS.Lib.js
String.prototype.format = function () {
    var text = this;
    //decrement to move to the second argument in the array
    var tokenCount = arguments.length;
    //check if there are two arguments in the arguments list
    if (tokenCount < 1) {
        //if there are not 2 or more arguments there's nothing to replace
        //just return the original text
        return text;
    }
    for (var token = 0; token < tokenCount; token++) {
        //iterate through the tokens and replace their placeholders from the original text in order
        text = text.replace(new RegExp("\\{" + token + "\\}", "gi"), arguments[token]);
    }
    return text;
};

// Removes leading whitespaces
String.prototype.ltrim = function () {
    return this.replace(/\s*((\S+\s*)*)/, "$1");
}

// Removes ending whitespaces
String.prototype.rtrim = function () {
    return this.replace(/((\s*\S+)*)\s*/, "$1");
}

// Removes leading and ending whitespaces
String.prototype.trim = function () {
    return this.ltrim().rtrim();
}

String.prototype.format = function () {
    var text = this;
    //decrement to move to the second argument in the array
    var tokenCount = arguments.length;
    //check if there are two arguments in the arguments list
    if (tokenCount < 1) {
        //if there are not 2 or more arguments there's nothing to replace
        //just return the original text
        return text;
    }
    for (var token = 0; token < tokenCount; token++) {
        //iterate through the tokens and replace their placeholders from the original text in order
        text = text.replace(new RegExp("\\{" + token + "\\}", "gi"), arguments[token]);
    }
    return text;
};

// wrap word in text
String.prototype.wordWrap = function (m, b, c) {
    var i, j, l, s, r;
    if (m < 1)
        return this;
    for (i = -1, l = (r = this.split("\n")).length; ++i < l; r[i] += s)
        for (s = r[i], r[i] = ""; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : ""))
            j = c == 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length
                || c == 1 && m || j.input.length + (j = s.slice(m).match(/^\S*/)).input.length;
    return r.join("\n");
};

// Array prototype
Array.prototype.removeAt = function (iIndex /*:int*/) /*:variant*/ {
    var vItem = this[iIndex];
    if (vItem) {
        this.splice(iIndex, 1);
    }
    return vItem;
};

Array.prototype.swapped = function (x, y /*:int*/) /*:variant*/ {
    this[x] = this.splice(y, 1, this[x])[0];
};
if (typeof String.prototype.startsWith != 'function') {
    try {
        String.prototype.startsWith = function (str) {
            return this.indexOf(str) == 0;
        };
    } catch (e) {
        //console.log(e);
    }
}
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

if (typeof list_movedown !== 'function') {
    function list_movedown(cbo) {
        var si = cbo.selectedIndex;
        if (si >= 0 && si <= cbo.length - 2) {
            var text = cbo.options[si].text;
            var value = cbo.options[si].value;
            var disabled = cbo.options[si + 1].disabled;
            cbo.options[si] = new Option(cbo.options[si + 1].text, cbo.options[si + 1].value);
            cbo.options[si + 1] = new Option(text, value);
            cbo.selectedIndex = si + 1;
            cbo.options[si].disabled = disabled;
        }
    }
}

function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

// Decimal round
if (!Math.round10) {
    Math.round10 = function (value, exp) {
        return decimalAdjust('round', value, exp);
    };
}

// Decimal floor
if (!Math.floor10) {
    Math.floor10 = function (value, exp) {
        return decimalAdjust('floor', value, exp);
    };
}

// Decimal ceil
if (!Math.ceil10) {
    Math.ceil10 = function (value, exp) {
        return decimalAdjust('ceil', value, exp);
    };
}

if (typeof list_moveup !== 'function') {
    function list_moveup(cbo) {
        var si = cbo.selectedIndex;
        if (si >= 1) {
            var text = cbo.options[si].text;
            var value = cbo.options[si].value;
            var disabled = cbo.options[si - 1].disabled;
            cbo.options[si] = new Option(cbo.options[si - 1].text, cbo.options[si - 1].value);
            cbo.options[si - 1] = new Option(text, value);
            cbo.selectedIndex = si - 1;
            cbo.options[si].disabled = disabled;
        }
    }
}

if (typeof list_remove !== 'function') {
    function list_remove(cbo) {
        var si = cbo.selectedIndex;
        if (si >= 0) {
            if (!cbo[si].disabled) {
                cbo.remove(si);
                if (cbo.options.length == si)
                    cbo.selectedIndex = si - 1;
                else
                    cbo.selectedIndex = si;
            }
        }
    }
}

if (typeof list_removeByValue !== 'function') {
    function list_removeByValue(cbo, value) {
        $.each(cbo.options, function (idx, item) {
            if ($(item).text().toLowerCase() == value.toLowerCase() && !item.disabled) {
                $(item).remove();
            }
        });
    }
}
if (typeof list_removeAllItem !== 'function') {
    function list_removeAllItem(cbo) {
        cbo.options.length = 0;
    }
}

if (typeof list_append !== 'function') {
    function list_append(cbo, elmTextId) {
        var countExists = 0;
        var text = $(elmTextId).val();
        if (text != "") {
            $.each(cbo.options, function (idx, item) {
                if ($(item).text().toLowerCase() == text.toLowerCase()) countExists++;
            });
            if (countExists <= 0) {
                cbo.options[cbo.options.length] = new Option(text, 0);
            }
        }
        $(elmTextId).val('');
        $(elmTextId).focus();
    }
}

if (typeof list_add !== 'function') {
    function list_add(cbo, text, val, disabled) {
        if (typeof (disabled) == "undefined") disabled = false;
        var countExists = 0;
        if (text != "") {
            $.each(cbo.options, function (idx, item) {
                if ($(item).text().toLowerCase() == text.toLowerCase()) countExists++;
            });
            if (countExists <= 0) {
                cbo.options[cbo.options.length] = new Option(text, val);
                cbo.options[cbo.options.length - 1].disabled = disabled;
            }
        }
    }
}

function getNameOnly(filename) {
    var index = filename.lastIndexOf("/") + 1;
    filename = filename.substr(index);
    return filename.replace(/.[^.]+$/, '');
}

function getExtentionOnly(fileext) {
    return fileext.split('.').pop();
}

function ResizeEmbed(embed, w, h) {
    if (embed == undefined) embed = "";

    var oW = "[\\s]width=\"([^\"]*)";
    var oH = "[\\s]height=\"([^\"]*)";
    var result = embed;
    try {
        if (result != "") {
            result = result.replace(new RegExp(oW, 'g'), " width=\"" + w);
            result = result.replace(new RegExp(oH, 'g'), " height=\"" + h); // + "\" "
            //            result = result.replace("<embed", '<embed wmode="transparent" ');
            //            result = result.replace("<embed", '<param name="wmode" value="transparent"></param><embed ');
        }
    }
    catch (err) {
        result = "";
    }
    if (result == undefined) result = "";
    return result;
}

function RemoveUnicode(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, "-");
    str = str.replace(/-+-/g, "-"); //replace (--) to (-)
    str = str.replace(/^\-+|\-+$/g, "");
    str = str.replace(/[&\/\\#,+()$~%.'":*?<>{};=_!]/g, "-");
    return str;
}

function ReplaceEmbed(embed) {
    if (embed == undefined) embed = "";
    var result = embed;
    try {

        if (result != "") {
            result = result.replace(/\\+/g, '');
        }
    }
    catch (err) {
        result = "";
    }
    if (result == undefined) result = "";
    return result;
}
//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\src\core\client\common\IMS.Settings.Config.js
/******************* IMS Settings Config***********************/
/******************* Vesion: 1.0 - 2/2/2016 ***********************/

(function (GetConfigData) {
    window.IMS = window.IMS || {};
    window.IMS.GetConfigData = GetConfigData();
})(function () {
    var IMS = window.IMS || {};
    // IMS.SettingConfig = window.IMS.SettingConfig || {};
    // IMS.GetChannelTokenFunction = window.IMS.GetChannelTokenFunction || {};

    var GetConfigData = {
        init: function (opts, callback) {
            // if (opts.type == 'photo-editor' || opts.type == 'svg-manager') {
            //     if (typeof callback == 'function') callback();
            // } else {

            // }

            if (!IMS.ChannelName) IMS.ChannelName = opts.nameSpace.toLowerCase();
            if (!IMS.Current_UserName) IMS.Current_UserName = opts.userName;
            if (!IMS.GetChannelTokenFunction) IMS.GetChannelTokenFunction = opts.getTokenFunction;

            if (IMS.SettingConfig) {
                callback();
                return;
            }

            var self = this;
            var checkTokken = function (callback) {
                IMS.Actions.Post({
                    params: {
                        token: ''
                    },
                    module: "photo-manager",
                    ashx: 'plugin-request',
                    action: "check-token",
                    success: function (res) {
                        if (!res.error) {
                            if (typeof callback == 'function') callback(res.data);
                        } else {
                            IMS.Actions.MessageBox(res.message);
                        }
                    }
                });
            }

            var getSettingConfig = function (channel_id, callback) {
                IMS.Actions.Post({
                    params: {
                        channel_id: channel_id,
                        merged: 1
                    },
                    module: "config-manager",
                    ashx: 'plugin-request',
                    action: "get-channel-info",
                    success: function (res) {
                        console.log(res);
                        if (!res.error) {
                            if (typeof callback == 'function') callback(res.data);
                        } else {
                            IMS.Actions.MessageBox(res.message);
                        }
                    }
                });
            }

            var checkSettingConfig = function (callback) {
                var self = this;
                if (IMS.SettingConfig) {
                    callback();
                    return;
                } else {

                }
            };

            if (!self.data) {
                if (!IMS.GetChannelTokenFunction) IMS.GetChannelTokenFunction = function (cb) {
                    cb('');
                }

                if (opts.type == 'photo-editor' || opts.type == 'svg-manager') {
                    if (typeof callback == 'function') callback();
                } else {

                }

                if (opts.type == 'photo-editor' || opts.type == 'svg-manager') {
                    if (typeof callback == 'function') {
                        callback();
                    }
                } else if (opts.type == 'photo-manager') {
                    checkTokken(function (data) {
                        IMS.ChannelId = data.channel_id;
                        IMS.Current_ApplicationId = data.application_id;

                        getSettingConfig(IMS.ChannelId, function (params) {
                            var arrChannelConfigs = params.data;
                            self.data = arrChannelConfigs;
                            IMS.SettingConfig = arrChannelConfigs;
                            if (typeof callback == 'function') callback();
                        });
                    });
                }
            }
            else {
                IMS.SettingConfig = self.data;
                if (typeof callback == 'function') {
                    callback();
                }
            }
        }
    };

    return GetConfigData;
});
//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\src\core\client\common\IMS.Socket.js
/*###############################################*/
/*  Lee Gấu
 /*  15/7/2016
 /*###############################################*/

(function (Socket) {
    window.IMS = window.IMS || {};
    window.IMS.Socket = Socket();
})(function () {
    var IMS = window.IMS || {};
    var Socket = {
        init: function (options) {
            var self = this;
            var moduleName = options.moduleName;

            self[moduleName] = {};
            self[moduleName].listen = options.listen;
            self[moduleName].getTokenFunction = options.getTokenFunction;

            self[options.moduleName].getTokenFunction(function (token) {
                self[moduleName].currentToken = token;
                self[moduleName].socket = io(
                    IMS.Config.baseUrl,
                    {
                        query:
                        'module=' + moduleName +
                        '&token=' + self[options.moduleName].currentToken +
                        '&userName=' + options.userName
                    });
                self[moduleName].socket.on('unauthorized', function (data) {
                    console.log(data)
                    self.login(options);
                });

                self[moduleName].listen(self[moduleName].socket);
            });
        },

        login: function (options) {
            var self = this;
            self[options.moduleName].getTokenFunction(function (token) {
                self[options.moduleName].currentToken = token;
                self[options.moduleName].socket.emit(
                    'login',
                    {
                        token: self[options.moduleName].currentToken,
                        userName: options.userName,
                        module: options.moduleName
                    });
            });
        }
    };

    return Socket;
});
//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\src\core\client\common\IMS.UIHelper.js
/******************* IMS UIHelper ***********************/
/* Created by  Lee Gấu 
/******************* Vesion: 1.0 - 2/2/2016 ***********************/
(function (UIHelper) {
    window.IMS = window.IMS || {};
    window.IMS.UIHelper = UIHelper();
})(function () {
    var IMS = window.IMS || {};
    var UIHelper = {};

    UIHelper.Thumb_W = function (width, fileName, SettingConfig) {
        if (fileName == "" || fileName == null) return;
        if (fileName.indexOf("http://") == 0 || fileName.indexOf("https://") == 0) {
            return fileName;
        } else {
            var newUrl = (SettingConfig.HOST_IMS_THUMB + "/thumb_w/" + width + (fileName.indexOf("/") == 0 ? "" : "/") + fileName).replace("//", "/").replace("http:/", "http://").replace("https:/", "https://");
            // if (fileName.indexOf(".gif", fileName.length - ".gif".length) !== -1) {
            //     return SettingConfig.HOST_IMS_THUMB + "/" + fileName;
            // }
            return newUrl;
        }
    }

    //Thumb width, nếu là ảnh gif sẽ thêm .png vào cuối ==>UI phải chỉnh khi hover lên thì chạy
    UIHelper.Thumb_W_V2 = function (width, fileName, SettingConfig) {
        if (fileName == "" || fileName == null) return;
        if (fileName.indexOf("http://") == 0 || fileName.indexOf("https://") == 0) {
            return fileName;
        } else {
            var thumbW = SettingConfig.HOST_IMS_THUMB.lastIndexOf("/") == (SettingConfig.HOST_IMS_THUMB.length - 1) ? "thumb_w/" : "/thumb_w/";
            var newUrl = (SettingConfig.HOST_IMS_THUMB + thumbW + width + (fileName.indexOf("/") == 0 ? "" : "/") + fileName).replace("//", "/").replace("http:/", "http://").replace("https:/", "https://");
            if (fileName.indexOf(".gif", fileName.length - ".gif".length) !== -1) {
                newUrl += '.png';
            }
            return newUrl;
        }
    }

    UIHelper.BuildRealImageUrl = function (url, noImageUrl, SettingConfig) {
        if (noImageUrl == undefined) noImageUrl = "";
        if (url != null && (url + "") != "")
            return SettingConfig.HOST_IMS_THUMB + "/" + url;
        else {
            if (noImageUrl == "")
                return SettingConfig.IMS_HOST_AVATAR + "/images/avatar1.gif";
            else
                return SettingConfig.HOST_BOOKMARK + noImageUrl;
        }
    }

    UIHelper.trimByWord = function (title, numberOfWords, afterFix, SettingConfig) {
        if (Number(numberOfWords) < 0) {
            numberOfWords = 10;
        }
        var result = '';
        var resultArray = title.trim().split(' ');

        if (resultArray.length > Number(numberOfWords)) {
            for (var i = 0; i < Number(numberOfWords); i++) {
                result += resultArray[i] + ' ';
            }
            result += afterFix;
        } else {
            result = title;
        }

        return result;
    }

    UIHelper.FormatThumb = function (width, height, url, createdDate, noImageUrl, SettingConfig) {
        if (typeof createdDate == 'undefined') createdDate = null;
        if (typeof noImageUrl == 'undefined' || noImageUrl == null) noImageUrl = '';
        if (typeof url == 'undefined' || url == null) return '';

        var hostThumbFormat = null == createdDate ? (SettingConfig.HOST_IMS_THUMB_FORMAT ? SettingConfig.HOST_IMS_THUMB_FORMAT : '') : createdDate;
        var hostThumb = SettingConfig.FILE_MANAGER_HTTPDOWNLOAD ? SettingConfig.FILE_MANAGER_HTTPDOWNLOAD : '';

        if (url.startsWith("http://") || url.startsWith("https://")) {
            if (url.indexOf(hostThumb) > -1) {
                return hostThumbFormat != '' ? hostThumbFormat.format(width, height) + '/' + url.replace(hostThumb, '') : url;
            }
            return url;
        } else {
            return hostThumbFormat != '' ? hostThumbFormat.format(width, height) + '/' + url.replace(hostThumb, '') : url;
        }
    }

    UIHelper.GetOnlyDate = function (dt, symbol) {
        if (typeof symbol == 'undefined') {
            symbol = null;
        }
        var dateTime = new Date(Number(dt));

        if (symbol == null) {
            return "{0}/{1}/{2}".format(dateTime.getDate(), dateTime.getMonth() + 1, dateTime.getFullYear());
        } else {
            var frameFormat = "{0}" + symbol + "{1}" + symbol + "{2}";
            return frameFormat.format(dateTime.getDate(), dateTime.getMonth() + 1, dateTime.getFullYear());
        }
    }

    UIHelper.Thumb_W_for_Video = function (width, fileName, SettingConfig) {
        var thumbHost = SettingConfig.VIDEO_MANAGER_THUMBSERVER;

        if (fileName == "" || fileName==null || fileName=='null' || fileName==undefined || fileName=='undefined')
            return IMS.Config.staticUrl + "statics/images/default-no-image.png";
        fileName = fileName.replace(/thumb_w\/\w+\//, '');

        var returnHtml = "";
        if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
            if (fileName.startsWith(thumbHost)) returnHtml = thumbHost + "thumb_w/" + width + (fileName.startsWith("/") ? "" : "/") + fileName.replace(thumbHost, "");
            else {
                var parser = document.createElement('a');
                parser.href = fileName;
                var url = parser.protocol + '//' + parser.host + '/';
                returnHtml = url + "thumb_w/" + width + (fileName.startsWith("/") ? "" : "/") + fileName.replace(url, "");
            }
        } else {
            returnHtml = SettingConfig.VIDEO_MANAGER_THUMBSERVER + "/thumb_w/" + width + (fileName.startsWith("/") ? "" : "/") + fileName;
        }

        returnHtml = returnHtml.replace("//", "/").replace("https:/", "https://").replace("http:/", "http://");
        return returnHtml;
    }

    UIHelper.BuildRealImageUrlForVideo = function (url, noImageUrl, SettingConfig) {
        if (typeof noImageUrl == 'undefined' || noImageUrl == null) noImageUrl = '';
        if (typeof url == 'undefined' || url == null) return '';

        var thumbHost = SettingConfig.VIDEO_MANAGER_THUMBSERVER;
        var fileName = url;

        if (fileName.startsWith("http://")) {
            return fileName;
        }
        if (url != null && (url + "") != "")
            return thumbHost + url;
        else {
            if (noImageUrl == "")
                return SettingConfig.HOST_STATIC + "/images/avatar1.gif";
            else
                return SettingConfig.HOST_BOOKMARK + noImageUrl;
        }
    }

    UIHelper.FormatFileSize = function (bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    UIHelper.BuildVideoEmbedCode = function (key, width, height, avatar, autostart, title, isDisableAdvertise) {
        if (typeof avatar == 'undefined' || avatar == null) avatar = '';
        if (typeof title == 'undefined' || title == null) title = '';
        if (typeof autostart == 'undefined' || autostart == null) autostart = false;
        if (typeof isDisableAdvertise == 'undefined' || isDisableAdvertise == null) isDisableAdvertise = false;

        // if (title != '' || title != null)
        //     title = HttpContext.Current.Server.UrlEncode(title);

        var sb = '';
        var advertise = isDisableAdvertise ? "&tag=false" : "";
        var id = key + "";
        var classId = "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000";
        var videoUrl = "http://vscc.hosting.vcmedia.vn/media/{0}".format(key);

        sb += "<object width=\"{0}\" height=\"{1}\" classid=\"{3}\" id=\"{2}\">".format(width, height, id, classId);
        sb += "<param name=\"wmode\" value=\"opaque\">";
        sb += "<param name=\"movie\" value=\"{0}\">", videoUrl;
        sb += "<param name=\"allowFullScreen\" value=\"true\">";
        sb += "<param name=\"flashvars\" value=\"videotag=true&autostart={0}&image={1}{2}{3}\">".format((autostart + '').toLowerCase(), avatar,
            '', advertise);
        sb += "<param name=\"allowscriptaccess\" value=\"always\">";
        sb += "<param name=\"bgcolor\" value=\"#000000\">";
        sb += "<embed width=\"{0}\" height=\"{1}\"  src=\"{2}\"  id=\"{3}\" name=\"{3}\" type=\"application/x-shockwave-flash\" allowscriptaccess=\"always\" allowfullscreen=\"true\" wmode=\"opaque\" flashvars=\"videotag=true&autostart={4}&image={5}{6}{7}\" bgcolor=\"#000000\" quality=\"high\"></object>"
            .format(width, height, videoUrl, id, (autostart + '').toLowerCase(), avatar, '', advertise);

        return sb;
    }

    UIHelper.BuildVideoEmbed = function (SettingConfig, key, width, height, isDisableAdvertise, avatar, autostart, title, layout) {
        if (typeof avatar == 'undefined' || avatar == null) avatar = '';
        if (typeof title == 'undefined' || title == null) title = '';
        if (typeof autostart == 'undefined' || autostart == null) autostart = false;
        if (typeof layout == 'undefined' || layout == null) layout = 0;
        if (typeof isDisableAdvertise == 'undefined' || isDisableAdvertise == null) isDisableAdvertise = false;

        var embedType = parseInt(SettingConfig.VIDEO_MANAGER_EMBED_TYPE);
        var embed = '';

        if (embedType == 1) {
            embed = UIHelper.BuildVideoEmbedCode(key, width, height, avatar, autostart, title, isDisableAdvertise);
        } else if (embedType == 2) {
            embed = UIHelper.BuildVideoEmbedCodeIframe(key, width, height, avatar, layout, isDisableAdvertise);
        } else {
            embed = UIHelper.BuildVideoEmbedCode(key, width, height, avatar, autostart, title, isDisableAdvertise);
        }

        return embed;
    }

    UIHelper.BuidLinkVideo = function (SettingConfig, url) {
        return SettingConfig.VIDEO_SHARING_DOWNLOAD + SettingConfig.VIDEO_MANAGER_UPLOAD_NAMESPACE + '/' + url;
    }

    return UIHelper;
});
//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\src\core\client\common\IMS.Utils.js
/******************* IMS Utils ***********************/
/* chuyển từ ChannelVN.Lib.js
/******************* Vesion: 1.0 - 2/2/2016 ***********************/
(function (Utils) {
    window.IMS = window.IMS || {};
    window.IMS.Utils = Utils();
})(function () {
    var Utils = {};

    Utils.Base64 = {
        // private property
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode: function (input) {
            if (typeof (input) == "undefined") var input = "";

            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Utils.Base64._utf8_encode(input);

            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        },

        // public method for decoding
        decode: function (input) {
            if (typeof (input) == "undefined") var input = "";

            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }

            output = Utils.Base64._utf8_decode(output);
            return output;

        },

        // private method for UTF-8 encoding
        _utf8_encode: function (string) {
            string = string.replace(/\r\n/g, "\n");

            var utftext = "";
            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }
            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode: function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while (i < utftext.length) {
                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }

            return string;
        }

    }

    /*---- Date -----*/
    Utils.ConvertTextToDate = function (str) {
        ///Date(1324224039773+0700)
        str = str.replace("/Date(", "").replace(")/", "");
        var d = new Date(parseInt(str));
        var day = d.getDate();
        day = day >= 10 ? day : '0' + day;
        var mon = d.getMonth() + 1;
        mon = mon >= 10 ? mon : '0' + mon;
        var year = d.getFullYear();
        year = year >= 10 ? year : '0' + year;
        var hour = d.getHours();
        hour = hour >= 10 ? hour : '0' + hour;
        var min = d.getMinutes();
        min = min >= 10 ? min : '0' + min;
        var sec = d.getSeconds();
        sec = sec >= 10 ? sec : '0' + sec;
        return day + "/" + mon + "/" + year + " " + hour + ":" + min + ":" + sec;
    }

    Utils.GetOnlyTime = function (strDate) {
        strDate = strDate.replace("/Date(", "").replace(")/", "");

        var dt = new Date(parseInt(strDate));
        var hour = dt.getHours();
        var min = dt.getMinutes();

        if (hour < 10) hour = '0' + hour;
        if (min < 10) min = '0' + min;

        return hour + ':' + min;
    }

    Utils.GetOnlyDate = function (strDate) {
        strDate = strDate.replace("/Date(", "").replace(")/", "");

        var dt = new Date(parseInt(strDate));
        var date = dt.getDate();
        var mon = dt.getMonth() + 1;

        if (date < 10) date = '0' + date;
        if (mon < 10) mon = '0' + mon;

        return "{0}/{1}/{2}".format(date, mon, dt.getFullYear());
    }

    Utils.GetOnlyDateMonth = function (strDate) {
        strDate = strDate.replace("/Date(", "").replace(")/", "");

        var dt = new Date(parseInt(strDate));
        var date = dt.getDate();
        var mon = dt.getMonth() + 1;

        if (date < 10) date = '0' + date;
        if (mon < 10) mon = '0' + mon;

        return "{0}/{1}".format(date, mon);
    }

    Utils.GetCurrentDate = function () {
        var dt = new Date();
        var date = dt.getDate();
        var mon = dt.getMonth() + 1;

        if (date < 10) date = '0' + date;
        if (mon < 10) mon = '0' + mon;

        var hour = dt.getHours();
        var min = dt.getMinutes();

        if (hour < 10) hour = '0' + hour;
        if (min < 10) min = '0' + min;

        return "{0}/{1}/{2} {3}:{4}".format(date, mon, dt.getFullYear(), hour, min);
    }

    Utils.GetCurrentDateNow = function () {
        var dt = new Date();
        var date = dt.getDate();
        var mon = dt.getMonth() + 1;

        if (date < 10) date = '0' + date;
        if (mon < 10) mon = '0' + mon;

        var hour = dt.getHours();
        var min = dt.getMinutes();

        if (hour < 10) hour = '0' + hour;
        if (min < 10) min = '0' + min;

        return "{0}-{1}-{2} {3}:{4}".format(dt.getFullYear(), mon, date, hour, min);
    }

    Utils.GetFullDate = function (strDate) {
        // strDate = strDate.replace("/Date(", "").replace(")/", "");
        var dt = new Date(parseInt(strDate));
        var date = dt.getDate();
        var mon = dt.getMonth() + 1;

        if (date < 10) date = '0' + date;
        if (mon < 10) mon = '0' + mon;

        var hour = dt.getHours();
        var min = dt.getMinutes();

        if (hour < 10) hour = '0' + hour;
        if (min < 10) min = '0' + min;

        return "{0}/{1}/{2} {3}:{4}".format(date, mon, dt.getFullYear(), hour, min);
    }

    Utils.GetLongDate = function (strDate) {
        strDate = strDate.replace("/Date(", "").replace(")/", "");

        var dt = new Date(parseInt(strDate));
        var date = dt.getDate();
        var weekday = new Array(7);

        weekday[0] = "Chủ Nhật";
        weekday[1] = "Thứ Hai";
        weekday[2] = "Thứ Ba";
        weekday[3] = "Thứ Tư";
        weekday[4] = "Thứ Năm";
        weekday[5] = "Thứ Sáu";
        weekday[6] = "Thứ Bảy";

        var dw = weekday[dt.getDay()];
        var mon = dt.getMonth() + 1;

        if (date < 10) date = '0' + date;
        if (mon < 10) mon = '0' + mon;

        var hour = dt.getHours();
        var min = dt.getMinutes();

        if (hour < 10) hour = '0' + hour;
        if (min < 10) min = '0' + min;

        return "{0} {1}/{2}/{3} {4}:{5}".format(dw, date, mon, dt.getFullYear(), hour, min);
    }

    Utils.GetTime = function (strDate) {
        try {
            strDate = strDate.replace("/Date(", "").replace(")/", "");

            var dt = new Date(parseInt(strDate));
            var date = dt.getDate();
            var weekday = new Array(7);

            weekday[0] = "Chủ Nhật";
            weekday[1] = "Thứ Hai";
            weekday[2] = "Thứ Ba";
            weekday[3] = "Thứ Tư";
            weekday[4] = "Thứ Năm";
            weekday[5] = "Thứ Sáu";
            weekday[6] = "Thứ Bảy";

            var dw = weekday[dt.getDay()];
            var mon = dt.getMonth() + 1;

            if (date < 10) date = '0' + date;
            if (mon < 10) mon = '0' + mon;

            var hour = dt.getHours();
            var min = dt.getMinutes();

            if (hour < 10) hour = '0' + hour;
            if (min < 10) min = '0' + min;

            return "{0}:{1}".format(hour, min);
        } catch (e) {
            return "n/a";
        }
    }

    Utils.GetTimeToString = function (strDate) {
        strDate = strDate.replace("/Date(", "").replace(")/", "");
        var dt = new Date(parseInt(strDate));
        return dt;
    }

    Utils.GetDateNow = function () {
        var dt = new Date();
        return dt;
    }

    Utils.CompareDateNow = function (strDate) {
        if (this.DateDiff("mi", this.GetDateNow(), this.GetTimeToString(strDate)) > 0) {
            return true;
        } else {
            return false;
        }
    }

    Utils.FormatDateTime = function (strDate) {
        // Vài giây trước
        // 1-59 phút trước
        // 1-23 giờ trước
        // 9:58 15/08/2010

        // Input DateTime
        strDate = strDate.replace("/Date(", "").replace(")/", "");
        var dt = new Date(parseInt(strDate));
        var yy = dt.getFullYear();
        var mm = (dt.getMonth() + 1);
        var dd = dt.getDate();
        var hr = dt.getHours();
        var mi = dt.getMinutes();
        var ss = dt.getSeconds();

        // Curent DateTime
        var curentDate = new Date();
        var cYY = curentDate.getFullYear();
        var cMM = (curentDate.getMonth() + 1);
        var cDD = curentDate.getDate();
        var cHR = curentDate.getHours();
        var cMI = curentDate.getMinutes();
        var cSS = curentDate.getSeconds();

        var strTime = "";

        // If InputDate Is Today
        var dif = curentDate.getTime() - dt.getTime();
        var numberSecond = Math.abs(dif / 1000);
        var numberMinute = Math.floor(numberSecond / 60);
        var numberHour = Math.floor(numberSecond / 3600);

        if (numberSecond < 60)
            strTime = " Vài giây trước";
        else if (numberSecond < 3600)
            strTime = numberMinute.toString() + " phút trước";
        else if (numberSecond < 3600 * 24)
            strTime = numberHour.toString() + " giờ trước";
        else {
            strTime = "";
            strTime += parseInt(dd) < 10 ? ('0' + dd) : dd;
            strTime += "/" + (parseInt(mm) < 10 ? ('0' + mm) : mm);
            strTime += "/" + (parseInt(yy) < 10 ? ('0' + yy) : yy);
            strTime += " " + (parseInt(hr) < 10 ? ('0' + hr) : hr);
            strTime += ":" + (parseInt(mi) < 10 ? ('0' + mi) : mi);
        }
        return strTime;
    }

    Utils.CheckDate = function (txtDate) {
        var currVal = txtDate;
        if (currVal == '') return false;

        //Declare Regex  
        var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
        var dtArray = currVal.match(rxDatePattern); // is format OK?

        if (dtArray == null) return false;

        //Checks for mm/dd/yyyy format.
        var dtMonth = dtArray[1];
        var dtDay = dtArray[3];
        var dtYear = dtArray[5];

        if (dtMonth < 1 || dtMonth > 12)
            return false;
        else if (dtDay < 1 || dtDay > 31)
            return false;
        else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31)
            return false;
        else if (dtMonth == 2) {
            var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
            if (dtDay > 29 || (dtDay == 29 && !isleap))
                return false;
        }
        return true;
    }
    Utils.DateDiff = function (datepart, startDate, endDate) {
        if (typeof (startDate) == "string") startDate = new Date(startdate);
        if (typeof (endDate) == "string") endDate = new Date(endDate);

        var diff = endDate - startDate;
        var result = 0;

        switch (datepart) {
            case "mi":
                result = Math.round(diff / (1000 * 60));
                break;
            case "h":
                result = Math.round(diff / (1000 * 60 * 60));
                break;
            case "d":
                result = Math.round(diff / (1000 * 60 * 60 * 24));
                break;
            case "m":
                result = Math.round(diff / (1000 * 60 * 60 * 24 * 30));
                break;
        }
        return result;
    }

    Utils.getDateTimePicker = function (dtval, includeTime) {
        if (includeTime == undefined) includeTime = true;
        if (dtval == undefined || dtval == null || dtval == "") return "";

        dtval = $.trim(dtval);

        var dt = $.datepicker.formatDate("yy-mm-dd", $.datepicker.parseDate('dd/mm/yy', dtval)).toString();
        var dtTime = includeTime ? dtval.substr(dtval.indexOf(' '), dtval.length) : ' 00:00';

        return dt + dtTime;
    }

    Utils.trimOnlyDate = function (strDate) {
        if (strDate == undefined || strDate == '') return strDate;
        return strDate.substring(0, strDate.indexOf(' ')).trim();
    }

    Utils.EscapeTitle = function (title) {
        return title.replace("'", "&apos;").replace("\"", "&quot;");
    }

    return Utils;
});

//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\src\plugins\photo-manager\mobile\app.js
/**
 * Created by Lee Gấu on 12/1/2017.
 */
(function(PM) {
    window.IMSPhotoMobileManager = PM();
})(function() {
    if (typeof(jQuery) != 'undefined') $ = jQuery.noConflict();
    var IMS = window.IMS || {};
    var PhotoMobileManagerIsInited = false;
    var PhotoMobileManager = {
        version: 1.0,
        init: function(opts) {

            var self = this;
            //console.log('PhotoMobileManager is initing');
            var options = {
                nameSpace: '',
                userName: '',
                type: 'photo-manager',
                params: {
                    zoneId: -1
                        // onBeforeCallback: function(data,callback){}
                },
                onLoad: function() {

                }
            };

            options = $.extend(true, {}, options, opts);
            options.mode = 'manager';
            self.checkInited(function() {
                IMS.Widgets.PhotoMobileManager.Init(options);
            });
        },

        checkInited: function(callback) {
            var self = this;
            if (PhotoMobileManagerIsInited) {
                callback();
            } else {
                setTimeout(function() {
                    self.checkInited(callback);
                }, 100);
            }
        },
        initGif: function(opts) {
            var self = this;

            var options = {
                nameSpace: '',
                userName: '',
                type: 'photo-manager',
                params: {
                    Accept: 'gif'
                }
            };

            options.mode = 'gif';
            $.extend(true, options, opts);
            self.checkInited(function() {
                IMS.Widgets.PhotoMobileManager.Init(options);
            });
        },
        initUpload: function(opts) {
            var self = this;
            //console.log('PhotoMobileManager mode upload is initing');
            var options = {
                nameSpace: '',
                userName: '',
                zoneId: -1,
                type: 'photo-manager',
                params: {}
            };
            options.mode = 'upload';
            $.extend(true, options, opts);

            if (typeof(options.params.element) == 'undefined') {
                //console.log('mode [upload] cần tham số [element] (truyền vào thẻ input type=file)!');
                return;
            }
            self.checkInited(function() {
                //console.log('PhotoMobileManager mode upload was loaded');
                IMS.Widgets.PhotoMobileManager.Init(options);
            });
        },
        uploadFromContent: function(opts) {
            var self = this;
            var options = {
                nameSpace: '',
                userName: '',
                zoneId: -1,
                type: 'photo-manager',
                params: {
                    callback: function() {

                    },
                    html: ''
                }
            };
            options.mode = 'uploadFromContent';
            $.extend(true, options, opts);

            self.checkInited(function() {
                //console.log('PhotoMobileManager mode uploadFromContent was loaded');

                IMS.Widgets.PhotoMobileManager.Init(options);
            });
        },
        uploadFromUrl: function(opts) {
            var self = this;
            var options = {
                nameSpace: '',
                userName: '',
                zoneId: -1,
                type: 'photo-manager',
                params: {
                    callback: function() {},
                    opts: {}
                }
            };
            options.mode = 'uploadFromUrl';
            $.extend(true, options, opts);

            self.checkInited(function() {
                //console.log('PhotoMobileManager mode uploadFromUrl was loaded');
                IMS.Widgets.PhotoMobileManager.Init(options);
            });
        },
        uploadAndReturnUrl: function(opts) {
            var self = this;
            var options = {
                nameSpace: '',
                userName: '',
                zoneId: -1,
                type: 'photo-manager',
                params: {
                    callback: function() {},
                    opts: {}
                }
            };
            options.mode = 'uploadAndReturnUrl';
            $.extend(true, options, opts);

            self.checkInited(function() {
                //console.log('PhotoMobileManager mode uploadAndReturnUrl was loaded');
                IMS.Widgets.PhotoMobileManager.Init(options);
            });
        },
        uploadAndSaveAlphabet: function(opts) {
            var self = this;
            var options = {
                nameSpace: '',
                userName: '',
                zoneId: -1,
                type: 'photo-manager',
                params: {
                    callback: function() {},
                    opts: {}
                }
            };
            options.mode = 'uploadAndSaveAlphabet';
            $.extend(true, options, opts);

            self.checkInited(function() {
                //console.log('PhotoMobileManager mode uploadAndSaveAlphabet was loaded');
                IMS.Widgets.PhotoMobileManager.Init(options);
            });
        },
        createPhoto: function(opts) {
            var self = this;
            var options = {
                nameSpace: '',
                userName: '',
                zoneId: -1,
                type: 'photo-manager',
                params: {
                    name: '',
                    url: '',
                    callback: function() {},
                    opts: {}
                }
            };
            options.mode = 'createPhoto';
            $.extend(true, options, opts);

            self.checkInited(function() {
                //console.log('PhotoMobileManager mode createPhoto was loaded');
                IMS.Widgets.PhotoMobileManager.Init(options);
            });
        },
        clonePhoto: function(opts) {
            var self = this;
            var options = {
                nameSpace: '',
                userName: '',
                zoneId: -1,
                type: 'photo-manager',
                params: {
                    name: '',
                    id: 0,
                    callback: function() {},
                    opts: {}
                }
            };
            options.mode = 'clonePhoto';
            $.extend(true, options, opts);

            self.checkInited(function() {
                //console.log('PhotoMobileManager mode clonePhoto was loaded');
                IMS.Widgets.PhotoMobileManager.Init(options);
            });
        },
        open: function() {

        },
        destroy: function() {

        },
        close: function() {

        },
        thumbPhoto: function(url, width) {
            var host_avatar = IMS.Widgets.PhotoMobileManager.SettingConfig.IMS_HOST_AVATAR;
            var fileName = url.split(host_avatar)[1];
            return IMS.UIHelper.Thumb_W(width, fileName);
        },
        Resource: {
            css: [
                'statics/libs/font-awesome/css/font-awesome.min.css',
                'statics/libs/xpull/xpull.css',
                'statics/css/PhotoMobileManager.css'
            ],
            js: [{
                    objectJs: 'jQuery',
                    url: 'statics/libs/jquery-2.0.3.min.js'
                },
                // {
                //     objectJs: 'jQuery.ui',
                //     url: 'statics/libs/jqueryui/js/jquery-ui-1.10.3.custom.min.js'
                // },
                {
                    objectJs: 'Handlebars',
                    url: 'statics/libs/handlebars-v4.0.5.min.js'
                },
                {
                    objectJs: 'xpull',
                    url: 'statics/libs/xpull/xpull.js'
                },
                // {
                //     objectJs: 'PullToRefresh',
                //     url: 'statics/libs/pulltorefresh.js'
                // }                
            ]
        }
    };

    var loadJs = function(callback) {
        IMS.Actions.LoadResource(PhotoMobileManager.Resource.js, function() {
            callback();
        });
    }

    var loadCss = function(callback) {
        IMS.Actions.LoadResource(PhotoMobileManager.Resource.css, function() {
            callback();
        });
    }
    setTimeout(function() {
        loadJs(function() {
            loadCss(function() {
                PhotoMobileManagerIsInited = true;
            });
        });
    }, 1000);
    return PhotoMobileManager;
});
//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\src\plugins\photo-manager\mobile\main.js
/**
 * Created by MT563 on 2/2/2016.
 */
/******************* IMS PhotoMobileManager Plugin ***********************/
/******************* Vesion: 1.0 - 28/1/2016 ***********************/

(function(PhotoMobileManager) {
    window.IMS = window.IMS || {};
    window.IMS.Widgets = window.IMS.Widgets || {};
    window.IMS.Widgets.PhotoMobileManager = PhotoMobileManager();
})(function() {
    var IMS = window.IMS || {};
    var Utils = window.IMS.Utils;

    var PhotoMobileManager = {};

    PhotoMobileManager = {
        ChannelName: null,
        Current_UserName: null,
        ChannelId: null,
        GetChannelTokenFunction: null,
        SettingConfig: null,
        CurrentToken: '',
        DataPost: {
            params: {

            },
            action: '',
            module: "photo-manager",
            ashx: 'plugin-request',
            success: function(res) {

            }
        },
        UpdatedData: [],
        CachedFolderData: [],
        PageSizeOnGrid: 24,
        PageSizeOnList: 30,
        MaxImageWidthForUse: 100000,
        NoUploadImageOnDomain: [

        ],
        MaxImageAllowInsert: 0, // 0 = không giới hạn
        PhotoCallback: function() {

        },
        AlbumCallback: function() {

        },
        IsCacheTemplate: true,
        CacheTemplate: '', //cache main template
        CacheUploadTemplate: '', // cache upload template
        CacheMultiPhotoSelectTemplate: '', // cache multi photo select 
        CurrentViewMode: 'grid',
        CurrentFilterMode: 'myphoto',
        MaxThumbWidthForListItem: 140,
        MaxThumbHeightForListItem: 90,
        MaxWidth: 640,
        DataForFilterCustomPhoto: [], //nếu có ảnh sẽ hiện tab ảnh trong bài
        Accept: 'jpg,png,jpeg,gif',
        UploadActionUrl: function() {
            return this.SettingConfig.FILE_MANAGER_HTTPSERVER;
        },
        onLoad: function() {

        },
        ErrorTokenCount: 0,
        requestTimeout: 100000,
        IsFullScreen: false
    };

    PhotoMobileManager.Init = function(opts) {

        var PM = this;
        PM.IsFullScreen = false;
        PM.ErrorTokenCount = 0;
        var errorPM = false;
        if (typeof opts.nameSpace == 'undefined' && PM.ChannelName == null) {
            errorPM = true;
            alert('Bạn chưa truyền tham số nameSpace vào!');
        } else if (typeof opts.userName == 'undefined' && PM.Current_UserName == null) {
            errorPM = true;
            alert('Bạn chưa truyền tham số userName vào!');
        } else if (typeof opts.getTokenFunction == 'undefined' && PM.GetChannelTokenFunction == null) {
            errorPM = true;
            alert('Bạn chưa truyền tham số getTokenFunction vào!');
        } else if (opts.nameSpace == '') {
            errorPM = true;
            alert('Bạn chưa truyền tham số nameSpace vào!');
        } else if (opts.userName == '') {
            errorPM = true;
            alert('Bạn chưa truyền tham số userName vào!');
        } else if (typeof opts.getTokenFunction != 'function') {
            errorPM = true;
            alert('Tham số getTokenFunction truyền vào không phải là function!');
        }

        if (opts.params.fullScreen != 'undefined')
            PM.IsFullScreen = opts.params.fullScreen;

        if (errorPM) return false;

        if (typeof(opts.params.customRatio) != 'undefined') {
            PM.CustomRatio = opts.params.customRatio;
        } else {
            if (typeof(opts.params.ratio) != 'undefined') {
                PM.CustomRatio = opts.params.ratio;
            } else {
                PM.CustomRatio = null;
            }
        }

        PM.ChannelName = opts.nameSpace.toLowerCase();
        PM.Current_UserName = opts.userName;
        PM.GetChannelTokenFunction = opts.getTokenFunction;
        if (typeof opts.onLoad == 'function') {
            PM.onLoad = opts.onLoad;
        }


        var open = function() {
            PM.zoneId = opts.params.zoneId;
            if (typeof(opts.mode) != 'undefined') {
                PM.Mode = opts.mode;
            }

            PM.MaxImageWidthForUse = typeof(opts.params.maxImageWidthForUse) != 'undefined' ? opts.params.maxImageWidthForUse : PM.MaxImageWidthForUse;

            switch (PM.Mode) {
                case 'upload':
                    PM.InitUploadForControl($(opts.params.element), function(arrImage) {
                        opts.params.callback(arrImage);
                    });
                    break;
                case 'uploadFromContent':

                    PM.Utils.DownloadPhotoInContentV2(opts.params.html, opts.params.callback, false, opts.params.opts);
                    break;
                case 'uploadFromUrl':
                    var cbUploadFromUrl = function(serverImg, clientImg) {
                        opts.params.callback(clientImg);
                    }
                    PM.Utils.UploadAndSaveToPhotoThenClone(opts.params.name, opts.params.url, cbUploadFromUrl, false);
                    break;
                case 'uploadAndReturnUrl':
                    PM.Utils.UploadAndReturnUrl(opts.params.name, opts.params.url, opts.params.callback);
                    break;
                case 'uploadAndSaveAlphabet':
                    PM.Utils.UploadAndSaveAlphabet(opts.params.name, opts.params.url, opts.params.tempId, opts.params.uploadIndexTemp, opts.params.callback);
                    break;
                case 'createPhoto':
                    PM.CreatePhoto(opts.params.url, opts.params.callback);
                    break;
                case 'clonePhoto':
                    PM.ClonePhoto(opts.params.id, opts.params.callback);
                    break;
                default:
                    PM.DataForFilterCustomPhoto = [];
                    if (typeof(opts.params.customPhotos) != "undefined") {
                        PM.DataForFilterCustomPhoto = opts.params.customPhotos;
                    }
                    PM.MaxImageAllowInsert = opts.params.maxSelected;
                    PM.PhotoCallback = function(arrImage) {
                        $('body,html').removeClass('overflow-hidden');
                        if (typeof opts.params.onBeforeCallback == 'function') {
                            if ($('#PMTabPhotoMobileFunc li[data-tab="upload"].active').length > 0) {
                                var arrFinal = [];
                                $('#PMUploadWrapper li .PMUploadContentInner').each(function() {
                                    var id = $(this).attr('data-id');
                                    var images = $.grep(arrImage, function(item) {
                                        return item.photoid == id;
                                    });
                                    if (images.length > 0) {
                                        arrFinal.push(images[0]);
                                    }
                                });
                                arrImage = arrFinal;
                            }
                            opts.params.onBeforeCallback(arrImage, function(isOk) {
                                if (isOk) {
                                    $('#IMSPopupMobile').hide();
                                    if (typeof opts.params.callback == 'function') opts.params.callback(arrImage);
                                }
                            });
                        } else {
                            $('#IMSPopupMobile').hide();
                            if (typeof opts.params.callback == 'function') opts.params.callback(arrImage);
                        }
                        PM.HideLoadingOverlay();
                    };
                    PM.AlbumCallback = opts.params.albumcallback;

                    if (typeof(opts.params.Accept) != "undefined") {
                        PM.Accept = opts.params.Accept;
                    }
                    PM.InitMain();
                    PM.regisHandlebarHelper();
                    break;
            }
        }
        if (PM.SettingConfig == null) {
            PM.getSettingConfig(function(data) {

                PM.ChannelId = data.channel_id;
                PM.Current_ApplicationId = data.application_id;
                // PM.DataPost.params.channel_id = PM.ChannelId;
                // PM.DataPost.params.application_id = PM.Current_ApplicationId;
                PM.DataPost.params.userName = PM.Current_UserName;

                PM.SettingConfig = data;
                open();
            });
            return;
        } else {
            open();
        }

    };


    PhotoMobileManager.getSettingConfig = function(callback) {
        var PM = this;
        if (PM.SettingConfig == null) {

            PM.Post({
                params: {

                },
                action: "get-channel-info",
                success: function(res) {
                    if (!res.error) {

                        if (typeof callback == 'function') callback(res.data);
                    } else {
                        alert(res.error.message);
                    }
                }
            });
        } else {
            if (typeof callback == 'function') callback(PM.SettingConfig);
            return PM.SettingConfig;
        }
    }

    PhotoMobileManager.Post = function(opts) {
        var PM = this;
        var dataPost = $.extend(true, {}, PM.DataPost);
        $.extend(true, dataPost, opts);
        var doAjax = function() {
            dataPost.params.token = PM.CurrentToken;
            dataPost.success = function(res) {
                if (res == null || undefined == res) return false;
                if (res.error && res.error.code == 401) {
                    //console.log('token invalid');
                    PM.ErrorTokenCount++;
                    if (PM.ErrorTokenCount > 5) {
                        alert('Lỗi get token!');
                        setTimeout(function() {
                            PM.ErrorTokenCount = 0;
                        }, 1000);
                    } else {
                        PM.GetChannelTokenFunction(function(token) {
                            //console.log(token)
                            PM.CurrentToken = token;
                            doAjax();
                        });
                    }
                    return false;
                }
                PM.ErrorTokenCount = 0;
                opts.success(res);
            }

            PM.PostAction(dataPost);
            return;
        }

        if (PM.CurrentToken == '') {
            PM.GetChannelTokenFunction(function(token) {
                PM.CurrentToken = token;
                doAjax();
            });
        } else {
            doAjax();
        }

    }

    PhotoMobileManager.PostAction = function(op) {
        var PM = this;
        var dataPost = {
            "module": op.module,
            "action": op.action
        };
        if (typeof op.params == 'undefined') op.params = {};

        var isShowTimeoutMessage = op.isShowTimeoutMessage ? op.isShowTimeoutMessage : false;
        var isPostObject = op.postObject != undefined ? op.postObject : true;
        if (isPostObject) {
            if (op.params != undefined && typeof(op.params) === 'object')
                dataPost = $.extend(dataPost, op.params);
        } else {
            if (op.params != undefined)
                dataPost = $.param(dataPost) + "&" + op.params;
        }

        var url = op.url != undefined && op.url != '' ? op.url : IMS.Config.baseAjaxUrl + 'api/' + (op.ashx == undefined ? "/plugin-request" : op.ashx);

        function doAjax() {

            var keyAbort = $.ajax({
                type: 'POST',
                url: url,
                data: dataPost,
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                dataType: "json",
                success: function(res) {

                    if (res == null || undefined == res) return false;

                    op.success(res);
                },
                error: function(x, t, m) {

                    if (op.error != undefined && typeof(op.error) == 'function') {
                        op.error(x);
                    } else if (t === "timeout") {
                        if (isShowTimeoutMessage) {
                            if (window.confirm("Thời gian xử lý quá lâu, bạn có muốn thử lại không?")) {
                                PM.PostAction(op);
                            }
                        }
                    } else {

                    }
                },
                timeout: op.timeout != undefined ? op.timeout : PM.requestTimeout
            });
            return;
        }

        doAjax();

    };

    PhotoMobileManager.autoScroll = function(opts) {
        var PM = this;

        $('#PMTabMobilePhoto').off('touchmove scroll').on('touchmove scroll').scroll(function() {
            if ($('#PMTabMobilePhoto').scrollTop() >= $('#PMListMobilePhoto').height() - $('#PMTabMobilePhoto').height() - 15 && $('#PMTabMobilePhoto').scrollTop() <= $('#PMListMobilePhoto').height() - $('#PMTabMobilePhoto').height() + 15) {
                PM.SearchPhotoPageIndex++;
                PM.SearchPhoto();
            }
        });
    }

    PhotoMobileManager.Popup = function(opts) {
        $('body,html').addClass('overflow-hidden');
        if ($('#IMSPopupMobile').length == 0) {
            $('body').append('<div id="IMSPopupMobile">' +
                '<div id="IMSPopupMobileHeader">' +
                '<p></p>' +
                '<span class="IMSPopupMobileClose"></span>' +
                '</div>' +
                '<div id="IMSPopupMobileMain"></div>' +
                '</div>');
        }


        if (opts.title == undefined) opts.title = "";
        if (opts.width == undefined) opts.width = $(window).width();
        if (opts.zIndex == undefined) opts.zIndex = 999999999999999999;
        if (opts.height == undefined) opts.height = $(window).height();
        if (opts.modal == undefined) opts.modal = true;
        if (opts.onOpen == undefined) opts.onOpen = function(e, ui) {};
        if (opts.onClose == undefined) opts.onClose = function(e, ui) {};

        if (opts.skin == undefined || opts.skin == "") opts.skin = "default";
        //if ($(opts.objContainer).length <= 0) {
        //    $("body").append('<div id="' + opts.objContainer.substr(1) + '" style="display:none; overflow-x:hidden; overflow-y:auto;" title="' + opts.title + '"></div>');
        //} else {
        //    $(opts.objContainer).css({ 'display': 'none', 'overflow-x': 'hidden', 'overflow-y': 'auto' });
        //    $(opts.objContainer).attr("title", opts.title);
        //}


        //if (opts.buttons == undefined) opts.buttons = {
        //    "Đóng": function () {
        //        $(this).dialog("close");
        //    }
        //};



        $('#IMSPopupMobileHeader p').text(opts.title);
        $('#IMSPopupMobileMain').css({
            'width': '100%',
            //'height': opts.height - $('#IMSPopupMobileHeader').height(),
            'height': 'calc(100% - ' + $('#IMSPopupMobileHeader').height() + 'px)',
        });

        $('.IMSPopupMobileClose').off('click').on('click', function() {
            $('#IMSPopupMobile').hide();
            $('body,html').removeClass('overflow-hidden');
        });

        $('#IMSPopupMobile').css({
            'position': 'fixed',
            'width': opts.width,
            'height': opts.height,
            //'max-height': 720,
            //'width': '100%',
            //'height': '100%',
            'z-index': opts.zIndex,
            'top': 0,
            'left': 0,
            'right': 0,
            'bottom': 0,
            'margin': '0',
            'display': 'block'
        });

        if (opts.HtmlBinding != undefined && typeof(opts.HtmlBinding) == 'function') {
            opts.HtmlBinding($('#IMSPopupMobileMain'));
        }
    }

    PhotoMobileManager.InitMain = function() {
        var PM = PhotoMobileManager;

        PM.Popup({
            title: "QUẢN LÝ ẢNH",
            zIndex: 999999999,
            buttons: {},
            HtmlBinding: function(obj) {


                PM.onLoad();
                var Accept = PM.Accept;

                var accept = Accept.split(',');
                accept = $.grep(accept, function(item, i) {
                    return item != '';

                });
                var arr = [];
                $.each(accept, function(i, item) {
                    item = '.' + item;
                    arr.push(item);

                });
                arr.join(',');

                var PMLeft = Handlebars.template(IMSPluginTemplate['photo-manager']['template-photo-mobile-manager'])({
                    FILE_MANAGER_HTTPSERVER: PM.SettingConfig.FILE_MANAGER_HTTPSERVER,
                    FILE_ACCEPT: arr
                });
                var htmlContent =
                    '<div id="PMWrapperOut">' +
                    '<div id="PMWrapperIn">' +
                    PMLeft +
                    '</div>' +
                    '</div>';
                $(obj).html(htmlContent);

                //$('#PMListMobilePhoto').css({
                //    height: $(window).height() - $('#IMSPopupMobileHeader').outerHeight() - $('#PMTabPhotoMobileFunc').outerHeight()
                //});
                $('#PMListMobilePhoto').html('');

                //$('#PMUploadWrapper').css({
                //    height: $(window).height() - 135
                //});

                PM.SearchPhoto(true);
                PM.autoScroll();
                PM.InitUpload('#PMHtml5UploadInput');
                // PullToRefresh.init({
                //     mainElement: '#PMListMobilePhoto',
                //     onRefresh: function() {
                //         PM.SearchPhoto(true);

                //     }
                // });
                $('#PMListMobilePhoto').xpull({
                    'callback':function(){
                        PM.SearchPhoto(true);
                    }
                 });
            }
        });
    };

    PhotoMobileManager.InitUploadForControl = function(inputFileId, callback) {
        var returnData = [];
        var $inputFile = $(inputFileId);
        var id = $inputFile.attr('id');
        if (typeof(id) == 'undefined') {
            id = 'IMSFileUpload' + new Date().getTime();
            $inputFile.attr('id', id);
        }
        $inputFile.addClass('IMSFileUpload');
        $inputFile.wrap('<div class="IMSFileUploadWrapper"></div>');

        var $wrapper = $inputFile.parent();
        var loading = '<svg width="20px" height="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="uil-hourglass"><rect x="0" y="0" width="100" height="100" fill="none" class="bk"></rect><g><path fill="none" stroke="#007282" stroke-width="5" stroke-miterlimit="10" d="M58.4,51.7c-0.9-0.9-1.4-2-1.4-2.3s0.5-0.4,1.4-1.4 C70.8,43.8,79.8,30.5,80,15.5H70H30H20c0.2,15,9.2,28.1,21.6,32.3c0.9,0.9,1.4,1.2,1.4,1.5s-0.5,1.6-1.4,2.5 C29.2,56.1,20.2,69.5,20,85.5h10h40h10C79.8,69.5,70.8,55.9,58.4,51.7z" class="glass"></path><clipPath id="uil-hourglass-clip1"><rect x="15" y="20" width="70" height="25" class="clip"><animate attributeName="height" from="25" to="0" dur="1s" repeatCount="indefinite" vlaues="25;0;0" keyTimes="0;0.5;1"></animate><animate attributeName="y" from="20" to="45" dur="1s" repeatCount="indefinite" vlaues="20;45;45" keyTimes="0;0.5;1"></animate></rect></clipPath><clipPath id="uil-hourglass-clip2"><rect x="15" y="55" width="70" height="25" class="clip"><animate attributeName="height" from="0" to="25" dur="1s" repeatCount="indefinite" vlaues="0;25;25" keyTimes="0;0.5;1"></animate><animate attributeName="y" from="80" to="55" dur="1s" repeatCount="indefinite" vlaues="80;55;55" keyTimes="0;0.5;1"></animate></rect></clipPath><path d="M29,23c3.1,11.4,11.3,19.5,21,19.5S67.9,34.4,71,23H29z" clip-path="url(#uil-hourglass-clip1)" fill="#ffab00" class="sand"></path><path d="M71.6,78c-3-11.6-11.5-20-21.5-20s-18.5,8.4-21.5,20H71.6z" clip-path="url(#uil-hourglass-clip2)" fill="#ffab00" class="sand"></path><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="180 50 50" repeatCount="indefinite" dur="1s" values="0 50 50;0 50 50;180 50 50" keyTimes="0;0.7;1"></animateTransform></g></svg>';
        var loadingTxt = 'Đang tải ảnh lên...';
        var def = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="20px" height="20px"><g><circle cx="160" cy="128" r="32" fill="#FFFFFF"/><path d="M381.313,311.125c-5.938-8.906-20.688-8.906-26.625,0l-32,48c-3.266,4.906-3.578,11.219-0.797,16.422   C324.672,380.75,330.094,384,336,384h16v32c0,8.836,7.156,16,16,16c8.844,0,16-7.164,16-16v-32h16   c5.906,0,11.328-3.25,14.109-8.453c2.781-5.203,2.469-11.516-0.797-16.422L381.313,311.125z" fill="#FFFFFF"/><path d="M480,0H32C14.328,0,0,14.328,0,32v320c0,17.672,14.328,32,32,32h192.945c7.992,71.887,69.062,128,143.055,128   c79.406,0,144-64.602,144-144v-16V32C512,14.328,497.672,0,480,0z M202.406,211.852c-5.641-4.836-13.875-5.148-19.875-0.758   L64,298.02V64h384v176c0,0-63.469-66.74-83.5-89.992c-3.12-3.622-7.484-5.938-12.266-6.008c-4.594-0.102-9.344,1.992-12.422,5.641   l-88.5,104.117L202.406,211.852z M478.727,384c-7.781,54.258-54.313,96-110.727,96s-102.945-41.742-110.727-96   c-0.75-5.238-1.273-10.555-1.273-16c0-61.855,50.141-112,112-112s112,50.145,112,112C480,373.445,479.477,378.762,478.727,384z" fill="#FFFFFF"/></g></svg>';
        var defTxt = 'Chọn ảnh...';
        $wrapper.append('<label class="IMSFileUploadLabel" for=' + id + '>' + def + '<span>' + defTxt + '</span></label>');

        var PM = PhotoMobileManager;
        var fileCount = 0;
        var currentFile = 0;
        $inputFile.each(function() {
            var $input = $(this),
                $label = $input.next('label'),
                labelVal = $label.html();

            $input.off('change').on('change', function(e) {
                var fileName = '';

                if (this.files && this.files.length > 1)
                    fileName = (this.getAttribute('data-multiple-caption') || 'đã chọn {count} ảnh.').replace('{count}', this.files.length);
                else if (e.target.value)
                    fileName = e.target.value.split('\\').pop();

                if (fileName)
                    $label.find('span').html(fileName);
                else
                    $label.html(labelVal);
            });

            // Firefox bug fix
            $input
                .on('focus', function() {
                    $input.addClass('has-focus');
                })
                .on('blur', function() {
                    $input.removeClass('has-focus');
                });
        });
        jQuery.event.props.push('dataTransfer');
        $inputFile.change(function(e) {
            fileCount += this.files.length;
            traverseFiles(this.files);
            returnData = [];
        });
        var uploadIndexTemp = 0;

        function uploadFile(file) {
            uploadIndexTemp++;
            file.uploadIndexTemp = uploadIndexTemp;
            var tempId = 'PM' + (new Date()).getTime() + uploadIndexTemp;
            if (typeof(FileReader) !== "undefined") {
                var reader = new FileReader();
                reader.onload = (function(file) {
                    return function(e) {
                        PM.Utils.UploadAndSaveAlphabet(file.name, e.target.result, tempId, file.uploadIndexTemp, function() {
                            currentFile++;
                            if (currentFile == fileCount) {
                                var obj = PM.Utils.ListUploadSuccsess;
                                obj.sort(function(a, b) {
                                    if (a.priority < b.priority) return -1;
                                    if (a.priority > b.priority) return 1;
                                    return 0;
                                });
                                var total = obj.length;

                                function processNextQueue() {
                                    if (obj.length > 0) {
                                        total--;
                                        var value = obj.pop();
                                        var itemId = value["tempId"];
                                        var name = value["name"];
                                        var url = value["url"];
                                        PM.CreatePhoto(url, function(newPhotoData) {
                                            if (typeof(newPhotoData) == "string") newPhotoData = JSON.parse(newPhotoData);
                                            returnData.push(newPhotoData);
                                            PM.processImageUpload(itemId, newPhotoData, processNextQueue);
                                            if (total == 0) {
                                                var arrImage = [];
                                                $.each(returnData, function(j, jtem) {
                                                    arrImage.push(PM.processDataForClonePhoto(jtem));
                                                });
                                                $wrapper.find('svg').replaceWith(function() {
                                                    return def;
                                                });
                                                $wrapper.find('span').text(defTxt);
                                                $inputFile.removeAttr('disabled');
                                                callback(arrImage);
                                                //$inputFile.replaceWith($inputFile.val('').clone(true));
                                                //PhotoMobileManager.Utils.ListUploadSuccsess = [];
                                            }
                                        });
                                    }
                                }
                                processNextQueue();
                            }
                        });
                    };
                }(file));
                reader.readAsDataURL(file);
            }
        }

        function traverseFiles(files) {
            var temp = [],
                err = '';
            if (typeof files !== "undefined") {
                for (var i = 0, l = files.length; i < l; i++) {
                    if (PM.IsValidFile(files[i].name)) {
                        temp.push(files[i]);
                    } else {
                        fileCount--;
                        err += files[i].name + '<br/>';
                    }
                }
            }
            if ($.grep(temp, function(item, i) {
                    return item.name.lastIndexOf('(') != -1;
                }).length == 0) {
                if (navigator.userAgent.toLowerCase().indexOf('chrome') == -1) {
                    temp.sort(PM.Utils.SortAlphabetByName);
                }
            }
            $wrapper.find('svg').replaceWith(function() {
                return loading;
            });
            $inputFile.attr('disabled', 'disabled');
            $wrapper.find('span').text(loadingTxt);
            $.each(temp, function(i, item) {
                uploadFile(item);
            });
            if (err != '') {
                alert('File: <b>' + err + '</b> không được phép upload!');
                $('#PMTabPhotoFunc li').removeClass('disabled');
            }
        }
    };

    PhotoMobileManager.processImageUpload = function(itemId, newPhotoData, callback) {
        var PM = PhotoMobileManager;
        $('#' + itemId).parent().removeClass('pending');
        $('#' + itemId).find('.PMUploadProcess > div')
            .animate({
                width: '100%'
            }, 500);
        $('#' + itemId).find('.PMUploadObjectImage')
            .addClass('show')
            .css({
                opacity: 0.4
            });
        $('#' + itemId).find('.PMUploadObjectImage img')
            .attr({
                src: PM.SettingConfig.HOST_IMS_THUMB + newPhotoData.image_url
            });
        $('#' + itemId).attr('data-id', newPhotoData.id);


        setTimeout(function() {
            $('#' + itemId).find('.PMUploadObjectImage').css({
                opacity: 1
            });
            if (typeof callback == "function") callback();
        }, 1500);
        if (typeof($.fn.sortable) != 'undefined')
            $('#PMUploadWrapper ul').sortable({
                items: 'li'
            });
    }

    PhotoMobileManager.calculateWidthImage = function(selector, isCustom, isUpload) {
        var PM = this;
        var mode = PM.CurrentViewMode;
        if (typeof isCustom == "undefined") isCustom = false;
        if (typeof isUpload == "undefined") isUpload = false;

        function processSizeImage() {
            var ww = $(window).width();
            var wP = $(selector).width();
            var w = 80,
                c = 5;

            if (wP <= ww) wP = ww;

            if (ww <= 425) {
                c = 3;
            } else if (425 < ww && ww <= 768) {
                c = 4;
            } else if (ww > 768) {

                c = 6;
            }

            //w = (wP / c);


            function cal(wm, cm) {
                wm = (wP / cm);


                if (wm < 80) {
                    cm = cm - 1;
                    var sk = cal(wm, cm);
                    return {
                        wm: sk.wm,
                        cm: sk.cm
                    };
                } else {
                    return {
                        wm: wm,
                        cm: cm
                    };
                }
            }

            return cal(w, c);
        };
        var obj = processSizeImage();
        var css = {
            width: obj.wm,
            height: $(selector).height() / parseInt($(selector).height() / obj.wm),
            amount: obj.cm
        };



        if (isCustom) {
            PM.SizeCustomPhoto = css;
            return PM.SizeCustomPhoto;
        } else if (isUpload) {
            PM.SizeUploadPhoto = css;
            return PM.SizeUploadPhoto;
        } else {
            if (mode == "grid") {
                PM.SizeThumbPhotoGrid = css;
                return PM.SizeThumbPhotoGrid;
            } else {
                PM.SizeThumbPhotoList = css;
                return PM.SizeThumbPhotoList;
            }
        }

    }

    PhotoMobileManager.regisHandlebarHelper = function() {
        var PM = this;
        var getWidth = function(size) {
            return size.split('x')[0];
        }
        var getHeight = function(size) {
            return size.split('x')[1];
        }
        var getPhotoName = function(name, url) {
            var nn = url.split('/').pop();
            var ext = nn.split('.').pop();
            var names = nn.split('-');
            names = names.slice(0, names.length - 1);
            nn = names.join('-') + '.' + ext;
            if (name != "" && name != null) {
                nn = name + "";
            }
            return nn;
        }

        var actived = function(mode) {
            return mode == PM.CurrentFilterMode ? ' active' : "";
        }
        Handlebars.registerHelper({
            widthPhoto: function(size) {
                size = Handlebars.Utils.escapeExpression(size);
                var result = getWidth(size);
                return new Handlebars.SafeString(result);
            },
            heightPhoto: function(size) {
                size = Handlebars.Utils.escapeExpression(size);
                var result = getHeight(size);
                return new Handlebars.SafeString(result);
            },
            linkPhoto: function(fileName, width) {
                if (typeof width == "undefined") width = 140;
                var link = IMS.UIHelper.Thumb_W(width, fileName, PM.getSettingConfig());
                var result = Handlebars.Utils.escapeExpression(link);
                return new Handlebars.SafeString(result);
            },
            linkPhotoForList: function(fileName, width) {
                if (typeof width == "undefined") width = 140;
                var link = '';
                if (fileName == undefined || fileName == '') link = IMS.Config.staticUrl + 'statics/images/default-no-image.png';
                else link = IMS.UIHelper.Thumb_W_V2(width, fileName, PM.getSettingConfig());
                var result = Handlebars.Utils.escapeExpression(link);
                return new Handlebars.SafeString(result);
            },
            iconPhoto: function(fileName) {
                var ext = fileName.substring(fileName.lastIndexOf('.') + 1);
                ext = ext.toLowerCase();
                if (ext == 'gif' || ext == '.gif') {
                    return '<span class="GifIconForPhoto"></span>';
                }
                return '';
            },
            classPhoto: function(fileName) {
                var ext = fileName.substring(fileName.lastIndexOf('.') + 1);
                ext = ext.toLowerCase();
                if (ext == 'gif' || ext == '.gif') {
                    return 'GifPhoto';
                }
                return '';
            },
            namePhoto: function(name, url) {
                var result = Handlebars.Utils.escapeExpression(getPhotoName(name, url));
                return new Handlebars.SafeString(result);
            },
            linkPhotoReal: function(fileName) {
                var link = IMS.UIHelper.BuildRealImageUrl(fileName, PM.getSettingConfig());
                var result = Handlebars.Utils.escapeExpression(link);
                return new Handlebars.SafeString(result);
            },
            'ifCond': function(parent_id, options) {
                if (parent_id === 0) {
                    return options.fn(this);
                }
                return options.inverse(this);
            },
            formatBytes: function(bytes, decimals) {
                if (bytes == 0) return '0 Byte';
                var k = 1000; // or 1024 for binary
                var dm = decimals + 1 || 3;
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                var i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
            }
        });

    }

    PhotoMobileManager.RegisterEvents = function(callback) {
        var PM = PhotoMobileManager;

        $('#PMListMobilePhoto .PMPhotoItem').off('click').on('click', function(e) {
            e.preventDefault();

            if ($(this).hasClass('active')) {

                var length = $('#PMListMobilePhoto .PMPhotoItem.active').length;
                var num = parseInt($(this).attr('data-num'));

                $(this).removeClass('active');
                $(this).find('.PMSelectedNumber').text('');
                $(this).attr('data-num', '');

                if (num > 0) {
                    for (var i = num + 1; i <= length; i++) {
                        $('#PMListMobilePhoto .PMPhotoItem[data-num="' + i + '"]').attr('data-num', i - 1).find('.PMSelectedNumber').text(i - 1);
                    }
                }
            } else {
                $(this).addClass('active');
                var num = $('#PMListMobilePhoto .PMPhotoItem.active').length;
                $(this).find('.PMSelectedNumber').text(num);
                $(this).attr('data-num', num);
            }
        });

        //Chèn ảnh
        $('#PMMobilePhotoInsert').off('click').on('click', function() {
            if ($('#PMListMobilePhoto .PMPhotoItem.active').length == 0) return;
            var arr = [];
            var photoId = [];
            var photos = $('#PMListMobilePhoto .PMPhotoItem.active');
            for (var j = 0; j < photos.length; j++) {
                var a = $.grep(photos, function(item) {
                    return $(item).attr('data-num') == j + 1;
                });
                $.each(a, function() {
                    arr.push(this);
                });
            }

            $.each(arr, function(i, item) {
                photoId.push($(item).attr('data-id'));
            });
            PM.ClonePhoto(photoId.join(';'), function(data) {
                var arrImage = new Array();
                $.each(data, function(i, item) {
                    arrImage.push(PM.processDataForClonePhoto(item));
                })


                PM.PhotoCallback(arrImage);
            });
        });

        //Làm mới ảnh
        $('#PMMobilePhotoRefresh').off('click').on('click', function(e) {
            $('#PMTabMobilePhoto').scrollTop(0);
            PM.SearchPhoto(true);
        });

        //Chèn ảnh vừa upload
        $('#PMInsertUploadedPhoto').off('click').on('click', function() {
            if ($(this).hasClass('disabled')) return;
            var sortArrayByName = function(a, b) {
                var aName = a.toLowerCase();
                var bName = b.toLowerCase();
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            };


            var arrImage = [];
            var arrId = [];
            var listofphotoid = '';
            $('.PMUploadContentInner').each(function(i) {
                arrId.push($(this).attr('data-id'));
            });

            arrId = arrId.sort(sortArrayByName);

            $.each(arrId, function(i, item) {
                listofphotoid += item + ';';
            });

            if (listofphotoid != '') {
                PM.ClonePhoto(listofphotoid, function(data) {
                    if (typeof(data) == "string") data = JSON.parse(data);
                    PM.ShowLoadingOverlay('#PMWrapperOut');
                    $.each(data, function(j, jtem) {
                        arrImage[j] = PM.processDataForClonePhoto(jtem);
                        arrImage[j].caption = '';
                    });
                    PM.PhotoCallback(arrImage);
                });
            } else {
                $('#PMUploadStatus').show();
            }
        });

        $('#PMTabPhotoMobileFunc li').off('click').on('click', function() {
            var tab_old_active = $('#PMTabPhotoMobileContent > div.active').attr('data-tab');
            if ($(this).hasClass('disabled') && $(this).attr('id') != 'PMUploadByUrl') return;
            if ($(this).hasClass('active') && $(this).attr('id') != 'PMUploadByUrl') return;
            var tab = $(this).attr('data-tab');

            if (tab == "upload") {
                //Chèn ảnh từ link
                if ($(this).attr('id') == 'PMUploadByUrl') PM.InitRemoteUpload();
            } else {
                $('#PMTabPhotoMobileFunc li').removeClass('active');
                $(this).addClass('active');
                $('#PMTabPhotoMobileContent > div').removeClass('active');
                $('#PMTabPhotoMobileContent > div[data-tab=' + tab + ']').addClass('active');
                if (tab == "list-photo") {
                    $('#PMFilterByKeyword').val('');
                    $('#PMFilterByFromDate').val('');
                    $('#PMFilterByToDate').val('');
                    PM.SearchPhoto(true);
                    $('.PMPhotoItem').removeClass('ui-selected');
                } else if (tab == "folder") {
                    PM.SearchPhotoInFolderPageIndex = 1;
                    $('#PMPhotoInFolderFilterByKeyword').val('');
                    $('#PMPhotoInFolderFilterByToDate').val('');
                    $('#PMPhotoInFolderFilterByToDate').val('');
                    $('.PMPhotoItem').removeClass('ui-selected');
                    PM.ShowFolderPanel();
                }

            }



        });


        if (typeof callback == "function") callback();
    };

    PhotoMobileManager.ClonePhoto = function(listphotoid, callback) {
        var PM = PhotoMobileManager;
        var listId = listphotoid.split(';');
        listId = $.grep(listId, function(item) {
            return item != "";
        });
        listId = listId.reverse();
        var count = listId.length;
        var current = 0;
        var listPhoto = [];
        PM.ShowLoadingOverlay('#PMWrapperOut');
        var processQueue = function() {
            if (listId.length > 0) {
                var id = listId.pop();

                PM.GetPhotoInfo(id, function(res) {

                    if (!res.error) {
                        listPhoto.push(res.data);
                        processQueue();
                        current++;

                        if (current == count)
                            if (typeof(callback) == "function") callback(listPhoto);
                    } else {
                        if (res.error.code == 404) {
                            var data = $.grep(PM.UpdatedData, function(item) {
                                return item.id == id;
                            });

                            if (data.length > 0) {
                                data = data[0];
                                listPhoto.push(data);
                                processQueue();
                                current++;
                                if (current == count) {
                                    if (typeof(callback) == "function") callback(listPhoto);
                                    PM.HideLoadingOverlay('#PMWrapperOut');
                                }

                            } else {
                                alert(res.error.message);
                            }
                        } else {
                            alert(res.error.message);
                        }
                    }
                });
            }
        }
        processQueue();

    };

    PhotoMobileManager.processDataForClonePhoto = function(jtem) {
        var PM = this;
        var imageUrl = PM.SettingConfig.HOST_IMS_THUMB + jtem.image_url || '';
        var originalSrc = PM.SettingConfig.HOST_IMS_THUMB + jtem.image_url || '';
        var name = jtem.name || '';
        var size = jtem.size || '0x0';
        var imagewidth = parseInt(PM.GetWidthFromDimention(size));
        var imageheight = parseInt(PM.GetHeightFromDimention(size));
        if ($.isNumeric(imagewidth)) {
            if (imagewidth > PM.MaxImageWidthForUse) {
                imageUrl = PM.FormatImageUrlForThumb(imageUrl);
            }
        }
        var image = new Object();
        image.name = name.trim();
        image.url = imageUrl;
        image.originalSrc = originalSrc;
        image.photoid = jtem.id;
        image.originalWidth = imagewidth;
        image.originalHeight = imageheight;
        return image;
    }

    PhotoMobileManager.GetWidthFromDimention = function(dimentions) {
        if (dimentions.length > 0) {
            return dimentions.split('x')[0];
        } else {
            return 600;
        }
    };

    PhotoMobileManager.GetHeightFromDimention = function(dimentions) {
        if (dimentions.length > 0) {
            return dimentions.split('x')[1];
        } else {
            return 600;
        }
    };

    //Tìm kiếm ảnh
    PhotoMobileManager.SearchPhoto = function(isReset, callback) {
        var PM = PhotoMobileManager;
        if (typeof(isReset) == "undefined") isReset = false;
        if (isReset) {
            PM.SearchPhotoPageIndex = 1;
            $('#PMListMobilePhoto').html('');
        }



        var pageSize = PM.PageSizeOnGrid;


        var ri = PM.calculateWidthImage('#PMListMobilePhoto');


        var row = parseInt($('#PMListMobilePhoto').height() / ri.width);

        pageSize = row * ri.amount + ri.amount;


        if (PM.CurrentViewMode == 'grid') PM.PageSizeOnGrid = pageSize;
        else PM.PageSizeOnList = pageSize;

        if (pageSize > 50) pageSize = 50;
        if (pageSize < 30) pageSize = 30;

        var params = {
            pageIndex: PM.SearchPhotoPageIndex,
            pageSize: pageSize,
            keyword: $('#PMFilterByKeyword').val(),
            viewMode: PM.CurrentViewMode,
            filterMode: PM.CurrentFilterMode,
            created_by: PM.CurrentFilterMode == 'myphoto' ? PM.Current_UserName : '',
            //zone_id: PM.getGroupZone($('#PMFilterByZone').val() || PM.zoneId),
            //created_date_from: Utils.getDateTimePicker($('#PMFilterByFromDate').val()),
            //created_date_to: Utils.getDateTimePicker($('#PMFilterByToDate').val())
        };
        if (params.zone_id == '-1') delete params['zone_id'];
        if (PM.Mode == 'gif') params.extension = PM.Mode;
        PM.getListPhoto(params, callback);

    };

    PhotoMobileManager.GetPhotoInfo = function(id, callback) {
        var PM = PhotoMobileManager;
        PM.Post({
            params: {
                id: id
            },
            action: "get-photo-info",
            success: function(res) {
                if (typeof(callback) == "function") callback(res);
            }
        });

    };

    PhotoMobileManager.getListPhoto = function(params, callback) {
        var PM = this,
            html = '';
        var ViewModeCls = PM.CurrentViewMode == 'grid' ? "GridMode" : "ListMode";
        var pageSize = PM.CurrentViewMode == 'grid' ? PM.PageSizeOnGrid : PM.PageSizeOnList;
        //if ($('#PMTabMobilePhoto').hasClass('loading')) return;
        if ($('#PMTabMobilePhoto .PMPhotoItem').length >= 30) {
            PM.StartLoading('#PMTabMobilePhoto');
        };
        PM.Post({
            params: params,
            action: "get-photos",
            success: function(res) {
                if (!res.error) {
                    var data = res.data;

                    //$.each(PM.UpdatedData, function (i, item) {
                    //    var arr = $.grep(data, function (jtem) {
                    //        return jtem.id == item.id;
                    //    });
                    //    if (arr.length == 0) data.push(item);
                    //});

                    var context = {
                        listPhoto: data
                    };
                    html = Handlebars.template(IMSPluginTemplate['photo-manager']['list-mobile-photos'])(context);
                    html = html.format(ViewModeCls);
                    $('#PMListMobilePhoto').append(html);



                    var ri = PM.calculateWidthImage('#PMListMobilePhoto');
                    $('#PMListMobilePhoto .PMPhotoItem.GridMode').css({
                        width: ri.width,
                        height: ri.height
                    });
                    $('#PMListMobilePhoto .PMPhotoItem.ListMode').css({
                        width: ri.width
                    });

                    PM.RegisterEvents();
                    if (typeof callback == "function") callback(data);
                } else {
                    alert(res.error.message);
                }
                PM.StopLoading('#PMTabMobilePhoto');
            }
        });

    };

    PhotoMobileManager.StartLoading = function(selector) {
        $(selector).addClass('loading');
    };

    PhotoMobileManager.StopLoading = function(selector) {
        $(selector).removeClass('loading');
    };

    PhotoMobileManager.InitUpload = function(inputFileId) {
        var PM = PhotoMobileManager;
        var list_success = [];
        //PM.Html5Upload(inputFileId);
        function processQueue() {
            if (list_success.length > 0) {
                var item = list_success.pop();
                if (!item.error) {
                    // Luu vao db
                    PM.CreatePhoto(item.url, function(data) {
                        $(item.li).attr({ 'data-done': '1' });
                        $(item.li).find('.PMUploadContentInner ').attr({
                            'data-id': data.id
                        });
                        $(item.li).find('.PMUploadObjectImage').css('opacity', 1).addClass('show');
                        $(item.li).find('.PMUploadObjectImage img').attr('src', PM.SettingConfig.HOST_IMS_THUMB + data.image_url);
                        processQueue();
                    });
                } else {

                }
            } else {
                $('#PMTabPhotoMobileFunc li').removeClass('disabled');
                $('#PMInsertUploadedPhoto').removeClass('disabled');
            }
        }
        $('#PMHtml5UploadInput').off('change').on('change', function(e) {
            $('#PMWrapperOut').removeClass('drag-n-drop');
            $('#PMTabPhotoMobileFunc li').addClass('disabled');
            $('#PMInsertUploadedPhoto').addClass('disabled');
            $('#PMTabPhotoMobileFunc li').removeClass('active');
            $('#PMUploadFromPc').addClass('active');
            $('#PMTabPhotoMobileContent > div').removeClass('active');
            $('#PMTabPhotoMobileContent > div[data-tab="upload"]').addClass('active');
            var input = $(this).get(0);
            var files = input.files;
            var imageType = /image.*/;

            var linkCount = files.length;
            var current = 0;
            $.each(files, function(i, file) {
                if (file.type.match(imageType)) {
                    var reader = new FileReader();
                    var filename = file.name;
                    var fName = filename.split('.')[0];
                    var ext = filename.split('.').pop();
                    var fName = fName + '-' + new Date().getTime() + '.' + ext;


                    var $li = $(PM.UploadHtml5ItemTemplate(fName.toLocaleLowerCase()));

                    $li.attr({
                        "file_name": fName,
                    });
                    $li.appendTo("#PMUploadWrapper ul");
                    reader.onload = function(e) {
                        var fileData = reader.result;
                        PM.Post({
                            params: {
                                fileName: fName,
                                fileData: fileData,
                                isOverwrite: true
                            },
                            action: "upload-file",
                            success: function(res) {
                                current++;
                                if (!res.error) {
                                    $li.attr({
                                        "uploadedFileName": res.data,
                                    });
                                    list_success.push({
                                        url: res.data,
                                        li: $li
                                    });

                                } else {
                                    list_success.push({
                                        li: $li,
                                        error: res.error.message
                                    });
                                }
                                if (current == linkCount) {
                                    processQueue();
                                }
                            }
                        });
                    }

                    reader.readAsDataURL(file);
                } else {
                    alert("File not supported!");
                }
            })
        });
    };



    PhotoMobileManager.IsValidFile = function(filename) {
        var PM = PhotoMobileManager;
        var ext = filename.split('?')[0].substring(filename.lastIndexOf('.') + 1);
        ext = ext.toLowerCase();
        var listAcceptExts = PM.Accept; /*,doc,docx,xls,xlsx,bmp,txt,mp3,mp4,avi,flv,rar,zip*/
        if (listAcceptExts.split(',').lastIndexOf(ext) != -1) {
            return true;
        } else {
            return false;
        }
    };

    PhotoMobileManager.GetPolicyForUpload = function(filename, isOverwrite, callback) {
        var PM = this;
        PM.Post({
            params: {
                fileName: filename,
                isOverwrite: isOverwrite
            },
            action: "get-policy-for-upload",
            success: function(res) {
                if (!res.error) {
                    callback(res.data);
                } else {
                    alert(res.error.message);
                }
            }
        });
    }

    PhotoMobileManager.UploadHtml5ItemTemplate = function(file_name) {
        var PM = this;
        var uploadIndexTemp = $("#PMUploadWrapper ul li").length;
        var tempId = 'PM' + (new Date()).getTime() + uploadIndexTemp;
        var ri = PM.calculateWidthImage('#PMUploadWrapper', false, true);
        return '<li class="PMUploadObject" style="height: ' + ($(window).width() / 2) + 'px">' +
            '<div data-id="' + tempId + '" class="PMUploadContentInner " id="' + tempId + '">' +

            '<div style="opacity: 0.7;" class="PMUploadObjectImage">' +
            '<img src="' + IMS.Config.staticUrl + 'statics/images/photo-upload.png' + '"/>' +
            '</div>' +
            '<label class="file_name"><i class="uploading"></i><span>' + file_name + '</span></label>' +
            //'<textarea class="PMUploadObjectNote" placeholder="Chú thích ảnh"></textarea>' +
            '</div>' +

            '</li>';
    }

    PhotoMobileManager.GetHostFile = function() {
        return this.SettingConfig.HOST_IMS_THUMB;
    }

    //Tạo mới 1 ảnh

    PhotoMobileManager.CreatePhoto = function(url, callback) {
        var PM = PhotoMobileManager;
        url = (url + '').split('?')[0];

        function getNameOnlyFromUrl(filename) {
            var index = filename.lastIndexOf("/") + 1;
            filename = filename.substr(index);
            return filename.replace(/.[^.]+$/, '');
        }
        if (url.lastIndexOf('k:') != -1) {
            url = url.replace('k:', '');
            url = url.replace('/' + getNameOnlyFromUrl(url), '');
        }

        var capacity = '0';
        var zone_id = -1;
        if ($('#PMFilterByZone').length > 0) {
            if ($('#PMFilterByZone').val() != -1) {
                zone_id = $('#PMFilterByZone').val();
            }
            if (zone_id == -1 && $('#cms_bm_news_zone_selectbox').length > 0) {
                zone_id = $('#cms_bm_news_zone_selectbox').val();
            }
        }
        //var catIdRelation = '';
        var photoId = 0;
        var image_note = '';
        var linkRelation = '';
        var note = '';
        var size = '0x0';
        var status = 1;
        var tags = '';
        var tagIdList = "";


        //insert_photo...
        PM.Post({
            params: {
                path: url
            },
            action: "get-file-info",
            success: function(res) {
                if (!res.error) {
                    // truyen url tra ve data

                    var file = res.data;
                    if (typeof(file) == "string") file = JSON.parse(file);
                    if (file == null) {
                        file = {
                            width: 500,
                            height: 500
                        }
                    }
                    size = file.width + 'x' + file.height;
                    capacity = file.size;

                    //truyen para de insert photo
                    var params = {
                        capacity: capacity,
                        zone_id: zone_id,
                        id: photoId,
                        image_note: image_note,
                        name: '',
                        note: note,
                        size: size,
                        status: status,
                        image_url: url,
                        folder_id: -1
                    }
                    if (params.zone_id == '-1') delete params['zone_id'];
                    PM.Post({
                        params: params,
                        action: "add-photo",
                        success: function(res2) {
                            if (!res2.error) {
                                if (typeof(callback) == "function") {
                                    params.id = res2.data;
                                    PM.UpdatedData.push(params);
                                    callback(params);
                                }

                            } else {
                                alert(res.error.message);
                            }
                        }
                    });
                } else {
                    alert(res.error.message);
                }
            }
        });

    };

    PhotoMobileManager.ShowLoadingOverlay = function(selector, note) {
        if (typeof note == "undefined") note = 'Đang tải dữ liệu...';
        var $selector = $(selector);
        if ($selector.length == 0) return;
        $selector.addClass('overflow-hidden');
        //console.log($selector)
        $('#IMSLoadingOverlay').remove();
        var $overlay = $('<div id="IMSLoadingOverlay"><div style="border-radius: 5px; width: 160px; height: 80px; position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; color: rgb(255, 255, 255); text-align: center; box-sizing: border-box; padding-top: 55px; background: url(' + IMS.Config.baseUrl + 'statics/images/video-loading.gif) no-repeat scroll center 15px / auto 40% rgb(30, 30, 30);">' + note + '</div></div>');
        $overlay.css({
            'position': selector != 'body' ? 'absolute' : 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            'background-color': 'rgba(30, 30, 30, 0.9)',
            'z-index': 9999999999999
        });



        $selector.append($overlay).removeClass('overflow-hidden');

    };

    PhotoMobileManager.HideLoadingOverlay = function(selector) {
        $('#IMSLoadingOverlay').remove();
        $(selector).removeClass('overflow-hidden');
    };

    PhotoMobileManager.RemoveUnicode = function(str) {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, "-");
        str = str.replace(/-+-/g, "-"); //replace (--) to (-)
        str = str.replace(/^\-+|\-+$/g, "");
        str = str.replace(/[&\/\\#,+()$~%.'":*?<>{};=_!]/g, "-");
        return str;
    };

    PhotoMobileManager.Utils = {
        DownloadPhotoInContentV2: function(html, callback, isRequireZoneSelect, opts) {
            var self = this;
            var $temp = $('<div>' + html + '</div>');
            var photos = [];
            //Xóa các ảnh lỗi
            $('img:not([src]), img[src=""]', $temp).remove();

            var _l = $('img', $temp).length;
            var count = 0;
            if (_l > 0) {
                PhotoMobileManager.ShowLoadingOverlay('body', "Đang xử lý dữ liệu...");
            } else {
                callback(html);
                return;
            }

            $('img', $temp).each(function(i, item) {
                var $img = $(this);
                var fname = $img.attr('src');
                if (typeof(fname) != "undefined") {
                    if (fname.lastIndexOf('data:image') != -1) {
                        if (fname.lastIndexOf('data:image/jpg') != -1 || fname.lastIndexOf('data:image/jpg') != -1) {
                            fname = 'photo-' + i + '.jpg';
                        } else if (fname.lastIndexOf('data:image/png') != -1) {
                            fname = 'photo-' + i + '.png';
                        } else if (fname.lastIndexOf('data:image/gif') != -1) {
                            fname = 'photo-' + i + '.gif';
                        } else {
                            fname = 'photo-' + i + '.jpg';
                        }
                    } else {
                        var ext = '.' + fname.split('.').pop().toLowerCase();
                        fname = 'photo-' + i + ext;
                    }
                    self.UploadAndSaveToPhotoThenClone(fname, $img.attr('src'), function(arrImage, arrImageClient) {
                        var img = arrImageClient[0];
                        $img.attr('src', img.originalSrc);
                        $img.attr('id', 'img_' + img.photoid);
                        $img.attr('photoid', img.photoid);
                        $img.attr('data-original', img.originalSrc);
                        $img.attr('rel', img.originalSrc);
                        photos.push(img)
                        count++;
                        if (count == _l) {
                            PhotoMobileManager.HideLoadingOverlay('body');
                            callback(photos);
                        }
                    });
                }
            });
        },
        //Upload, Lưu vào Photo sau đó clone sang PhotoPublished và trả về url
        UploadAndSaveToPhotoThenClone: function(filenameWithExtention, fileBase64OrUrl, callback) {
            var self = this;

            self.UploadAndReturnUrl(filenameWithExtention, fileBase64OrUrl, function(url, name) {

                PhotoMobileManager.CreatePhoto(name, function(newPhotoData) {
                    PhotoMobileManager.ClonePhoto(newPhotoData.id, function(data) {
                        if (typeof(callback) == "function")
                            callback(data, self.ConvertFromPhotoEntityToClientPhoto(data));
                    });
                });
            });
        },
        UploadAndReturnUrl: function(filenameWithExtention, fileBase64OrUrl, callback, isOverwrite, isCutting) {
            var self = this;
            if (typeof(isOverwrite) == 'undefined') isOverwrite = false;
            filenameWithExtention = (filenameWithExtention + '').split('?')[0];
            self.CheckImageLoaded(fileBase64OrUrl, {
                success: function() {
                    var name = filenameWithExtention.substring(0, filenameWithExtention.lastIndexOf('.'));
                    var ext = '.' + filenameWithExtention.split('.').pop();
                    if ($.inArray(ext.toLowerCase(), ['.jpg', '.jpeg', '.png', '.gif']) == -1) {
                        ext = '.jpg';
                    }
                    if (ext == '') ext = '.jpg';
                    if (!isOverwrite) {
                        name = PhotoMobileManager.RemoveUnicode(name);
                        name = name + '-' + new Date().getTime() + ext;
                        //Nếu ảnh thuộc các domain của vccorp thì bỏ thumb_w đi
                        if (fileBase64OrUrl.lastIndexOf('http://') != -1) {
                            $.each(PhotoMobileManager.NoUploadImageOnDomain, function(i, item) {
                                if (fileBase64OrUrl.startsWith(item)) {
                                    fileBase64OrUrl = fileBase64OrUrl.replace(/thumb_w\/\w+\//, '');
                                }
                            });
                        }
                    }
                    //---------
                    var filename = name;
                    if ($('.VCCopyPasteUpload').length <= 0) {
                        var uploadForm = '<div style="display:none;"><form action="' + PhotoMobileManager.UploadActionUrl() + '" method="POST" enctype="multipart/form-data" class="VCCopyPasteUpload">' +
                            '<input type="hidden" name="policy" class="VCPolicyTxt" /><input type="hidden" name="signature" class="VCSignatureTxt" />' +
                            '<input type="hidden" name="source" class="VCSourceTxt" />' +
                            '</form></div>';
                        $('body').append(uploadForm);
                    }
                    //console.log('isOverwrite: ' + isOverwrite);
                    PhotoMobileManager.GetPolicyForUpload(filename, isOverwrite, function(data) {
                        if (typeof(data) == "string") data = JSON.parse(data);
                        var policy = data.policy;
                        var signature = data.signature;
                        var path = data.path;
                        var uploadedFileName = path + '/' + filename;

                        $('.VCCopyPasteUpload .VCPolicyTxt').val(policy);
                        $('.VCCopyPasteUpload .VCSignatureTxt').val(signature);
                        $('.VCCopyPasteUpload .VCSourceTxt').val(fileBase64OrUrl);
                        var $li = $(PhotoMobileManager.UploadHtml5ItemTemplate(filename));
                        var createProgressBar = function(progress) {
                            return '<span class="bar" style="width: 100%;">100%</span>';
                        };

                        var index = $("#PMUploadWrapper ul li").length;

                        $li.attr({
                            "policy": policy,
                            "file_name": filename,
                            "fileext": ext,
                            "signature": signature,
                            "uploadedFileName": uploadedFileName
                        });

                        //Set all the information for this upload on the context (li) for easier access            
                        $li.find(".file_name").html('<i class="uploading"></i><span>' + filename + '</span>');
                        $li.find(".progress").html(createProgressBar());

                        if (!isCutting) $li.appendTo("#PMUploadWrapper ul");
                        $('form.VCCopyPasteUpload').submit(function() {
                            $.ajax({
                                type: "POST",
                                dataType: "",
                                url: $(this).attr('action'),
                                data: $(this).serializeArray(),
                                success: function() {

                                },
                                statusCode: {
                                    200: function() {
                                        var imageUrl = path + "/" + filename;
                                        callback($li, imageUrl, path);
                                    },
                                    400: function(a) {
                                        var err = a.responseText;
                                        if (typeof(err) == 'string') err = JSON.parse(err);
                                        var errDesc = err.description.toLowerCase();
                                        if (errDesc.lastIndexOf('[error#4001]') != -1) {
                                            var correctExt = errDesc.split('/')[1];
                                            var newExt = '';
                                            switch (correctExt) {
                                                case 'jpeg':
                                                case 'jpg':
                                                    newExt = 'jpg';
                                                    break;
                                                case 'png':
                                                    newExt = 'png';
                                                    break;
                                                case 'gif':
                                                    newExt = 'gif';
                                                    break;
                                            }
                                            var fullName = filenameWithExtention;
                                            var fullNameNew = fullName.replace('.' + fullName.split('.').pop(), '.' + newExt);

                                            $li.remove();
                                            self.UploadAndReturnUrl(fullNameNew, fileBase64OrUrl, callback, isOverwrite);

                                        }else if (errDesc.lastIndexOf('[error#4002]') != -1){
                                            //chinhnb show loi width >10MB
                                            callback($li, err);                                            
                                        }
                                    },
                                    502: function() {

                                    }
                                },
                                done: function() {

                                },
                                error: function(x, t, m) {

                                }
                            });
                            return false;
                        });
                        $('.VCCopyPasteUpload').submit().off('submit');
                    });
                },
                failure: function() {}
            });
        },
        CheckImageLoaded: function(src, cfg) {

            function isType(o, t) {
                return (typeof o).indexOf(t.charAt(0).toLowerCase()) === 0;
            }

            cfg.target = 'body';

            var img, prop;
            cfg = cfg || (isType(src, 'o') ? src : {});

            img = document.createElement('img');
            src = src || cfg.src;

            if (!src) {
                return 'Không phải ảnh';
            }

            prop = isType(img.naturalWidth, 'u') ? 'width' : 'naturalWidth';
            img.alt = cfg.alt || img.alt;
            img.src = src;
            document.body.appendChild(img);

            // Loaded?
            if (img.complete) {
                if (img[prop]) {
                    if (isType(cfg.success, 'f')) {
                        cfg.success.call(img);
                        //IMS.Actions.Log('Load thành công: ' + src);
                        img.remove();
                    }
                } else {
                    if (isType(cfg.failure, 'f')) {
                        cfg.failure.call(img);
                        //IMS.Actions.Log('Load lỗi: ' + src);
                        img.remove();
                    }
                }
            } else {
                if (isType(cfg.success, 'f')) {
                    img.onload = function() {
                        cfg.success.call(img);
                    };
                    //IMS.Actions.Log('Load thành công: ' + src);
                    img.remove();
                }
                if (isType(cfg.failure, 'f')) {
                    img.onerror = cfg.failure;
                    //IMS.Actions.Log('Load lỗi: ' + src);
                    img.remove();
                }
            }
            return img;
        },
        //Chuyển từ entity trong DB thành ảnh phục vụ cho js
        ConvertFromPhotoEntityToClientPhoto: function(imgs) {
            var imgArrs = [];
            if (typeof(imgs) == "string") {
                imgArrs.push(imgs);
            } else {
                imgArrs = imgs;
            }
            var arrImage = new Array();

            $.each(imgArrs, function(i, item) {
                var image = new Object();
                image.name = item.name;
                image.originalSrc = PhotoMobileManager.GetHostFile() + item.image_url;
                image.photoid = item.id;
                image.originalWidth = parseInt(item.size.split('x')[0]);
                image.originalHeight = parseInt(item.size.split('x')[1]);
                var returnUrl = item.image_url;
                returnUrl = PhotoMobileManager.GetHostFile() + item.image_url;
                image.url = returnUrl;
                arrImage[i] = image;
            });
            return arrImage;
        },
        //Upload theo alphabet
        ListUploadSuccsess: [],
        UploadAndSaveAlphabet: function(filenameWithExtention, fileBase64OrUrl, tempId, uploadIndexTemp, callback) {
            var self = this;
            self.UploadAndReturnUrl(filenameWithExtention, fileBase64OrUrl, function($li, url, name) {
                if ($('#cms_bm_news_txt_title').length > 0) {
                    if ($('#cms_bm_news_txt_title').val().length > 5) {
                        name = $('#cms_bm_news_txt_title').val();
                    }
                }
                var item = {
                    tempId: tempId,
                    filename: filenameWithExtention,
                    url: url,
                    name: name,
                    priority: uploadIndexTemp
                };

                self.ListUploadSuccsess.push(item);

                if (typeof(callback) == "function")
                    callback(url, name);
            });
        },
        SortAlphabetByName: function(a, b) {
            var aName = a.name.toLowerCase();
            var bName = b.name.toLowerCase();
            if (aName < bName) return -1;
            if (aName > bName) return 1;
            return 0;
        }

    }

    return PhotoMobileManager;
});
//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\src\plugins\photo-manager\common\utils\utils.js
/******************************** Utils ************************************/
//Chứa các Utils dùng chung.
//Upload & trả về đường dẫn ảnh.


(function(Utils) {
    window.IMS = window.IMS || {};
    window.IMS.Widgets = window.IMS.Widgets || {};
    window.IMS.Widgets.PhotoManager = window.IMS.Widgets.PhotoManager || {};
    window.IMS.Widgets.PhotoManager.Utils = Utils();
})(function() {
    var Utils = {};
    Utils.countplay=0;
    Utils.isSmartPhone = function() {
        return false;
    };
    Utils.UploadOverwrite = function(filenameWithExtention, fileBase64OrUrl, callback) {
        Utils.UploadAndReturnUrl(filenameWithExtention, fileBase64OrUrl, callback, true);
    };
    Utils.UploadAndReturnUrl = function(filenameWithExtention, fileBase64OrUrl, callback, isOverwrite, isCutting) {
        var PM = IMS.Widgets.PhotoManager;
        if (typeof(isOverwrite) == 'undefined') isOverwrite = false;
        filenameWithExtention = (filenameWithExtention + '').split('?')[0];
        PM.Utils.CheckImageLoaded(fileBase64OrUrl, {
            success: function() {
                var name = filenameWithExtention.substring(0, filenameWithExtention.lastIndexOf('.'));
                var ext = '.' + filenameWithExtention.split('.').pop();
                if ($.inArray(ext.toLowerCase(), ['.jpg', '.jpeg', '.png', '.gif']) == -1) {
                    ext = '.jpg';
                }
                if (ext == '') ext = '.jpg';
                if (fileBase64OrUrl.split(';')[0] == 'data:image/png') {
                    ext='.png';
                }
                if (!isOverwrite) {
                    //name = PM.RemoveUnicode(name);//v1
                    name = PM.RemoveUnicodeAndAddSeperatorV2(name);//chinhnb v2
                    name = name + '-' + new Date().getTime() + ext;
                    //Nếu ảnh thuộc các domain của vccorp thì bỏ thumb_w đi
                    if (fileBase64OrUrl.lastIndexOf('http://') != -1) {
                        $.each(PM.NoUploadImageOnDomain, function(i, item) {
                            if (fileBase64OrUrl.startsWith(item)) {
                                fileBase64OrUrl = fileBase64OrUrl.replace(/thumb_w\/\w+\//, '');
                            }
                        });
                    }
                }
                //---------
                var filename = name;
                var imageMaxWidth='';
                if(PM.SettingConfig.PHOTO_IMS_IMAGE_MAX_WIDTH != undefined){
                    imageMaxWidth='<input type="hidden" name="image_max_width" class="VCImageMaxWidthTxt" />';
                }
                if ($('.VCCopyPasteUpload').length <= 0) {
                    var uploadForm = '<div style="display:none;"><form action="' + PM.UploadActionUrl() + 'upload" method="POST" enctype="multipart/form-data" class="VCCopyPasteUpload">' +
                        '<input type="hidden" name="policy" class="VCPolicyTxt" />'+
                        '<input type="hidden" name="signature" class="VCSignatureTxt" />' +
                        '<input type="hidden" name="source" class="VCSourceTxt" />' +
                        imageMaxWidth +
                        '</form></div>';
                    $('body').append(uploadForm);
                }
                //console.log('isOverwrite: ' + isOverwrite);
                IMS.Widgets.PhotoManager.GetPolicyForUpload(filename, isOverwrite, function(data) {
                    if (typeof(data) == "string") data = JSON.parse(data);
                    var policy = data.policy;
                    var signature = data.signature;
                    var path = data.path;
                    var uploadedFileName = path + '/' + filename;
                    var imageMaxWidth='';

                    $('.VCCopyPasteUpload .VCPolicyTxt').val(policy);
                    $('.VCCopyPasteUpload .VCSignatureTxt').val(signature);
                    $('.VCCopyPasteUpload .VCSourceTxt').val(fileBase64OrUrl);
                    if(PM.SettingConfig.PHOTO_IMS_IMAGE_MAX_WIDTH != undefined){
                        imageMaxWidth=PM.SettingConfig.PHOTO_IMS_IMAGE_MAX_WIDTH;
                        $('.VCCopyPasteUpload .VCImageMaxWidthTxt').val(imageMaxWidth);
                    }
                    var $li = $(PM.UploadHtml5ItemTemplate(filename));
                    var createProgressBar = function(progress) {
                        return '<span class="bar" style="width: 100%;">100%</span>';
                    };

                    var index = $("#PMUploadWrapper ul li").length;

                    $li.attr({
                        "policy": policy,
                        "file_name": filename,
                        "fileext": ext,
                        "signature": signature,
                        "uploadedFileName": uploadedFileName,
                        'image_max_width':imageMaxWidth
                    });

                    //Set all the information for this upload on the context (li) for easier access            
                    $li.find(".file_name").html('<i class="uploading"></i><span>' + filename + '</span>');
                    $li.find(".progress").html(createProgressBar());

                    if (!isCutting) $li.appendTo("#PMUploadWrapper ul");
                    $('form.VCCopyPasteUpload').submit(function() {
                        
                        var formData = new FormData(this);//$(this).serializeArray();

                        console.log('POST.url:' + $(this).attr('action'));
                        console.log('POST.data:' + formData);                        

                        $.ajax({
                            type: "POST",                            
                            url: $(this).attr('action'),
                            data: formData,
                            processData: false,
							contentType: false,
                            success: function() {

                            },
                            statusCode: {
                                200: function() {
                                    Utils.countplay=0;
                                    var imageUrl = path + "/" + filename;
                                    callback($li, imageUrl, path);
                                },
                                400: function(a) {
                                    var err = a.responseText;
                                    if (typeof(err) == 'string') err = JSON.parse(err);
                                    var errDesc = err.description.toLowerCase();
                                    if (errDesc.lastIndexOf('[error#4001]') != -1) {
                                        var correctExt = errDesc.split('/')[1];
                                        var newExt = '';
                                        switch (correctExt) {
                                            case 'jpeg':
                                            case 'jpg':
                                                newExt = 'jpg';
                                                break;
                                            case 'png':
                                                newExt = 'png';
                                                break;
                                            case 'gif':
                                                newExt = 'gif';
                                                break;
                                        }
                                        var fullName = filenameWithExtention;
                                        var fullNameNew = fullName.replace('.' + fullName.split('.').pop(), '.' + newExt);

                                        $li.remove();                                        
                                        if(Utils.countplay<3){
                                            Utils.UploadAndReturnUrl(fullNameNew, fileBase64OrUrl, callback, isOverwrite);
                                            Utils.countplay++;
                                        }else{
                                            Utils.countplay=0;
                                            var imageUrl = path + "/" + filename;
                                            callback($li, imageUrl, path);
                                        }                                                                                

                                    }else if (errDesc.lastIndexOf('[error#4002]') != -1){
                                        //chinhnb show loi width >10MB
                                        callback($li, err);                                            
                                    }
                                },
                                404: function() {
                                    console.log('error.statusCode=404');
                                    var imageUrl = path + "/" + filename;                                
                                    callback($li, imageUrl, path);
                                },
                                502: function() {
                                    console.log('error.statusCode=502');
                                }
                            },
                            done: function() {

                            },
                            error: function(x, t, m) {
                                console.log('error.x: ' + x);                                
                                //var imageUrl = path + "/" + filename;                                
                                //callback($li, imageUrl, path);
                            }
                        });
                        return false;
                    });
                    $('.VCCopyPasteUpload').submit().off('submit');
                });
            },
            failure: function() {  
                callback({status_code:400,description:"Không load được ảnh."}, fileBase64OrUrl);
            }
        });
    };
    //Upload theo alphabet
    Utils.ListUploadSuccsess = [];
    Utils.UploadAndSaveAlphabet = function(filenameWithExtention, fileBase64OrUrl, tempId, uploadIndexTemp, callback) {
        var PM = IMS.Widgets.PhotoManager;
        PM.Utils.UploadAndReturnUrl(filenameWithExtention, fileBase64OrUrl, function($li, url, name) {
            if ($('#cms_bm_news_txt_title').length > 0) {
                if ($('#cms_bm_news_txt_title').val().length > 5) {
                    name = $('#cms_bm_news_txt_title').val();
                }
            }
            var item = {
                tempId: tempId,
                filename: filenameWithExtention,
                url: url,
                name: name,
                priority: uploadIndexTemp
            };

            PM.Utils.ListUploadSuccsess.push(item);

            if (typeof(callback) == "function"){
                if(typeof $li=="object"){
                    if($li.status_code==400){
                        callback({
                            status_code:400,
                            description:$li.description,
                            path:url
                        });
                        return;
                    }
                }
                callback(url, name);                
            }                
        });
    };
    Utils.SortAlphabet = function(a, b) {
        var aName = a.filename.toLowerCase();
        var bName = b.filename.toLowerCase();
        if (aName < bName) return -1;
        if (aName > bName) return 1;
        return 0;
    };
    Utils.SortAlphabetByName = function(a, b) {
        var aName = a.name.toLowerCase();
        var bName = b.name.toLowerCase();
        if (aName < bName) return -1;
        if (aName > bName) return 1;
        return 0;
    };
    //Upload, Lưu vào Photo sau đó trả về đường dẫn ảnh.
    Utils.UploadAndSaveToPhoto = function(filenameWithExtention, fileBase64OrUrl, callback, isCutting) {
        var PM = IMS.Widgets.PhotoManager;
        if (typeof isCutting == "undefined") isCutting = false;
        PM.Utils.UploadAndReturnUrl(filenameWithExtention, fileBase64OrUrl, function(fakeUI, url) {
            if(typeof fakeUI=="object"){
                if(fakeUI.status_code==400){
                    callback(url,{
                        status_code:400,
                        description:fakeUI.description,
                        path:url
                    });
                    return;
                }
            }
            var name_goc = (filenameWithExtention + '').split('?')[0].substring(0, filenameWithExtention.lastIndexOf('.'));
            PM.CreatePhoto(url, function(data) {
                if (!isCutting) {
                    $(fakeUI).attr({
                        'data-done': '1'
                    });
                    $(fakeUI).find('.PMUploadContentInner ').attr({
                        'data-id': data.id
                    });
                    $(fakeUI).find('.PMUploadObjectImage').css('opacity', 1).addClass('show');
                    $(fakeUI).find('.PMUploadObjectImage img').attr('src', PM.SettingConfig.HOST_IMS_THUMB + data.image_url);
                    $(fakeUI).find('.PMUploadProcess').removeClass('progress');

                    if ($('#PMUploadWrapper ul li').length == $('#PMUploadWrapper ul li[data-done="1"]').length) {
                        $('#PMUploadWrapper ul').sortable({
                            items: 'li'
                        });
                        $('#PMTabPhotoFunc li').removeClass('disabled');
                        $('#PMInsertUploadedPhoto').removeClass('disabled');
                    }
                }

                if (typeof(callback) == "function") callback(url, data);
            },name_goc);
        }, false, isCutting);
    };
    //Upload, Lưu vào Photo sau đó clone sang PhotoPublished và trả về url
    Utils.UploadAndSaveToPhotoThenClone = function(filenameWithExtention, fileBase64OrUrl, callback) {
        var PM = IMS.Widgets.PhotoManager;
        PM.Utils.UploadAndReturnUrl(filenameWithExtention, fileBase64OrUrl, function(url, name) {
            if(typeof url=="object"){
                if(url.status_code==400){
                    callback(name,{
                        status_code:400,
                        description:url.description,
                        path:name
                    });
                    return;
                }
            }
            var name_goc = (filenameWithExtention + '').split('?')[0].substring(0, filenameWithExtention.lastIndexOf('.'));
            PM.CreatePhoto(name, function(newPhotoData) {
                PM.ClonePhoto(newPhotoData.id, function(data) {
                    if (typeof(callback) == "function")
                        callback(data, PM.Utils.ConvertFromPhotoEntityToClientPhoto(data));
                });
            },name_goc);
        });
    };
    //Chỉ upload lên storage và trả về url
    Utils.UploadFromUrlOnlyStorage = function(filenameWithExtention, fileBase64OrUrl, callback) {
        var PM = IMS.Widgets.PhotoManager;
        PM.Utils.UploadAndReturnUrl(filenameWithExtention, fileBase64OrUrl, function(url, name) {            
            if (typeof(callback) == "function"){
                if(typeof url=="object"){
                    if(url.status_code==400){
                        callback({
                            status_code:400,
                            description:url.description,
                            path:name
                        });
                        return;
                    }
                }
                callback({
                    name:name,
                    path:PM.GetHostFile()+name
                });               
            }                
        });
    };
    //Chuyển từ entity trong DB thành ảnh phục vụ cho js
    Utils.ConvertFromPhotoEntityToClientPhoto = function(imgs) {
        var PM = IMS.Widgets.PhotoManager;
        var imgArrs = [];
        if (typeof(imgs) == "string") {
            imgArrs.push(imgs);
        } else {
            imgArrs = imgs;
        }
        var arrImage = new Array();

        $.each(imgArrs, function(i, item) {
            var image = new Object();
            image.name = item.name;
            image.originalSrc = PM.GetHostFile() + item.image_url;
            image.photoid = item.id;
            image.originalWidth = parseInt(item.size.split('x')[0]);
            image.originalHeight = parseInt(item.size.split('x')[1]);
            var returnUrl = item.image_url;
            returnUrl = PM.GetHostFile() + item.image_url;
            image.url = returnUrl;
            arrImage[i] = image;
        });
        return arrImage;
    };
    //Crop và trả về đường dẫn ảnh đã crop
    Utils.CropAndReturnUrl = function() {

    };
    //Crop, Lưu vào Photo sau đó trả về đường dẫn ảnh đã crop
    Utils.CropAndSaveToPhotoThenReturnUrl = function() {

    };
    //Crop, Lưu vào Photo, Clone sang photo Published sau đó trả về đường dẫn ảnh đã crop
    Utils.CropAndSaveToPhotoThenCloneThenReturnUrl = function() {

    };
    //Create & Clone
    Utils.CreatePhotoAndClone = function(name, url, callback) {
        var PM = IMS.Widgets.PhotoManager;
        PM.CreatePhoto(url, function(newPhotoData) {
            PM.ClonePhoto(newPhotoData.id, function(data) {
                if (typeof(callback) == "function") {
                    var image = new Object();
                    image.name = '';
                    image.originalSrc = PM.GetHostFile() + newPhotoData.image_url;
                    image.photoid = data[0].Id;
                    image.originalWidth = parseInt(data[0].Size.split('x')[0]);
                    image.originalHeight = parseInt(data[0].Size.split('x')[1]);
                    var returnUrl = newPhotoData.image_url;
                    if (image.originalWidth > PM.MaxImageWidthForEditor) {
                        returnUrl = PM.FormatImageUrlForThumb(newPhotoData.image_url);
                    } else {
                        returnUrl = PM.GetHostFile() + newPhotoData.image_url;
                    }
                    image.url = returnUrl;
                    var arrImage = new Array();
                    arrImage[0] = image;
                    callback(arrImage);
                }
            });
        },name);
    };
    Utils.CheckImageLoaded = function(src, cfg) {

        function isType(o, t) {
            return (typeof o).indexOf(t.charAt(0).toLowerCase()) === 0;
        }

        cfg.target = 'body';

        var img, prop;
        cfg = cfg || (isType(src, 'o') ? src : {});

        img = document.createElement('img');
        src = src || cfg.src;

        if (!src) {
            return 'Không phải ảnh';
        }

        prop = isType(img.naturalWidth, 'u') ? 'width' : 'naturalWidth';
        img.alt = cfg.alt || img.alt;
        img.src = src;
        document.body.appendChild(img);

        // Loaded?
        if (img.complete) {
            if (img[prop]) {
                if (isType(cfg.success, 'f')) {
                    cfg.success.call(img);
                    //IMS.Actions.Log('Load thành công: ' + src);
                    img.remove();
                }
            } else {
                if (isType(cfg.failure, 'f')) {
                    cfg.failure.call(img);
                    //IMS.Actions.Log('Load lỗi: ' + src);
                    img.remove();
                }
            }
        } else {
            if (isType(cfg.success, 'f')) {
                img.onload = function() {
                    cfg.success.call(img);
                };
                //IMS.Actions.Log('Load thành công: ' + src);
                img.remove();
            }
            if (isType(cfg.failure, 'f')) {
                img.onerror = cfg.failure;
                //IMS.Actions.Log('Load lỗi: ' + src);
                img.remove();
            }
        }
        return img;
    };
    //Tải toàn bộ ảnh trong nội dung
    Utils.UploadQueue = [];
    Utils.CurrentMatch = null;
    Utils.DownloadPhotoInContentV2 = function(html, callback, isRequireZoneSelect, opts) {
        var $temp = $('<div>' + html + '</div>');
        //Xóa các ảnh lỗi
        $('img:not([src]), img[src=""]', $temp).remove();

        var _l = $('img', $temp).length;
        var count = 0;
        if (_l > 0) {
            IMS.Actions.Waiting("Hệ thống đang xử lý dữ liệu. Xin đợi...", '#WaitingForUploadImage');
        } else {
            callback(html);
            return;
        }

        $('img', $temp).each(function(i, item) {
            var $img = $(this);
            var fname = $img.attr('src');
            if (typeof(fname) != "undefined") {
                if (fname.lastIndexOf('data:image') != -1) {
                    if (fname.lastIndexOf('data:image/jpg') != -1 || fname.lastIndexOf('data:image/jpg') != -1) {
                        fname = 'photo-' + i + '.jpg';
                    } else if (fname.lastIndexOf('data:image/png') != -1) {
                        fname = 'photo-' + i + '.png';
                    } else if (fname.lastIndexOf('data:image/gif') != -1) {
                        fname = 'photo-' + i + '.gif';
                    } else {
                        fname = 'photo-' + i + '.jpg';
                    }
                } else {
                    var ext = '.' + fname.split('.').pop().toLowerCase();
                    fname = 'photo-' + i + ext;
                }
                Utils.UploadAndSaveToPhotoThenClone(fname, $img.attr('src'), function(arrImage, arrImageClient) {
                    var img = arrImageClient[0];
                    $img.attr('src', img.originalSrc);
                    $img.attr('id', 'img_' + img.photoid);
                    $img.attr('photoid', img.photoid);
                    $img.attr('data-original', img.originalSrc);
                    $img.attr('rel', img.originalSrc);
                    count++;
                    if (count == _l) {
                        $('#WaitingForUploadImage').dialog('close');
                        console.log($temp.html())
                        callback($temp.html());
                    }
                });
            }
        });
    }
    Utils.DownloadPhotoInContent = function(html, callback, isRequireZoneSelect, opts) {
        var PM = IMS.Widgets.PhotoManager;
        if (typeof(isRequireZoneSelect) == "undefined") isRequireZoneSelect = false;
        var elementWaitingBox = "#cms_bm_contentpaste_waitingbox";
        var imgReg = /<img[^>]+src\s*=\s*[\'\"](http[^\'\"]+)[\'\"][^>]*>/gi;
        var _count = 0;
        var _max = 0;
        var isCallbacked = false;
        var _funcPrivate = function(img, m) {
            //console.log(img);
            if (img.length > 0) {
                var imageMaxWidth = 640;
                if (typeof(opts) != 'undefined') {
                    if (typeof(opts.imageMaxWidth) != 'undefined') {
                        imageMaxWidth = opts.imageMaxWidth;
                    }
                };
                var w = img[0].originalWidth;
                if (w > imageMaxWidth) {
                    var urlOnly = img[0].url.replace(PM.GetHostFile(), '');
                    img[0].url = PM.GetHostFile() + 'thumb_w/' + imageMaxWidth + '/' + urlOnly;
                }
                replaceImg = m[0].replace(/src\s*=\s*[\'\"]([^\'\"]+)[\'\"]/gi, 'id="img_' + img[0].photoid + '"' + 'src="' + img[0].url + '" photoid="' + img[0].photoid + '" rel="' + img[0].originalSrc + '" type="photo"').replace(/id\s*=\s*[\"\'][^\"\']*[\"\']/gi, 'id="img_' + img[0].photoid + '"').replace(/rel\s*=\s*[\"\'][^\"\']*[\"\']/gi, 'rel="' + img[0].originalSrc + '"');
                html = html.replace(m[0], replaceImg);
            } else {
                html = html.replace(m[0], '<p></p>');
            }
            _count++;
            if (_count == 1) {
                IMS.Actions.Waiting("Hệ thống đang xử lý dữ liệu. Xin đợi...", elementWaitingBox);
            }
            if (_count == _max) {
                $(elementWaitingBox).dialog("close");
                $('#cms_bm_contentpaste_waitingbox').parents('.ui-dialog').remove();
                callback(html);
                isCallbacked = true;
            }
        };

        while (match = imgReg.exec(html)) {
            _max++;
            if (match.length > 1) {
                var file = _max + '-' + match[1].split('/').pop();
                if (file !== null) {
                    PM.Utils.UploadQueue.push({
                        filename: file,
                        url: match[1],
                        match: match
                    });
                } else {
                    //console.log(file);
                }
            }
        }
        ProcessNextQueue();

        function ProcessNextQueue() {
            if (PM.Utils.UploadQueue.length > 0) {
                var photo = PM.Utils.UploadQueue.pop();
                //Thử trường hợp abc.jpg?width=600
                var tempUrl = (photo.url + '').split('?')[0];

                function ProcessCurrentQueue(url) {
                    //Gán match hiện tại vào biến (vì đã sử dụng tuần tự (queue) nên có thể dùng 1 biến để lưu match)
                    PM.Utils.CurrentMatch = photo.match;
                    PM.Utils.UploadAndSaveToPhotoThenClone(photo.filename, photo.url, function(img, imgClient) {
                        _funcPrivate(imgClient, PM.Utils.CurrentMatch);
                        ProcessNextQueue();
                    });
                }

                PM.Utils.CheckImageLoaded(tempUrl, {
                    success: function() {
                        ProcessCurrentQueue(tempUrl);
                    },
                    failure: function() {
                        tempUrl = (photo.url + '');
                        PM.Utils.CheckImageLoaded(tempUrl, {
                            success: function() {
                                ProcessCurrentQueue(tempUrl);
                            },
                            failure: function() {
                                ProcessNextQueue();
                            }
                        });
                    }
                });

            } else {
                if (isCallbacked == false) {
                    $(elementWaitingBox).dialog().dialog("close");
                    $('#cms_bm_contentpaste_waitingbox').parents('.ui-dialog').remove();
                    callback(html);
                    isCallbacked = true;
                }
            }
        }
        if (_max == 0 && isCallbacked == false) {
            $(elementWaitingBox).dialog().dialog("close");
            $('#cms_bm_contentpaste_waitingbox').parents('.ui-dialog').remove();
            callback(html); // nếu callback chỗ này sảy ra tình trạng thừa chữ undefined ở editor vì đã chạy vào file vcimageupload trước.
            isCallbacked = true;
        }
    };
    Utils.DownloadPhotoInContentForExternal = function(html, callback, isRequireZoneSelect) {
        var PM = IMS.Widgets.PhotoManager;
        if (typeof(isRequireZoneSelect) == "undefined") isRequireZoneSelect = true;
        var elementWaitingBox = "#cms_bm_contentpaste_waitingbox";
        var imgReg = /<img[^>]+src\s*=\s*[\'\"](http[^\'\"]+)[\'\"][^>]*>/gi;
        var _count = 0;
        var _max = 0;

        var _funcPrivate = function(img, m) {
            if (img.length > 0) {
                //replaceImg = m[0].replace(/src\s*=\s*[\'\"]([^\'\"]+)[\'\"]/gi, 'id="img_' + img[0].photoid + '"' + 'src="' + img[0].url + '" photoid="' + img[0].photoid + '" rel="' + img[0].originalSrc + '" type="photo"').replace(/id\s*=\s*[\"\'][^\"\']*[\"\']/gi, 'id="img_' + img[0].photoid + '"').replace(/rel\s*=\s*[\"\'][^\"\']*[\"\']/gi, 'rel="' + img[0].originalSrc + '"');
                replaceImg = m[0].replace(/src\s*=\s*[\'\"]([^\'\"]+)[\'\"]/gi, 'id="img_' + img[0].photoid + '"' + 'src="' + img[0].url + '" photoid="' + img[0].photoid + '" rel="' + img[0].originalSrc + '" type="photo"').replace(/photoid\s*=\s*[\"\'][^\"\']*[\"\']/gi, 'photoid="img_' + img[0].photoid + '"').replace(/rel\s*=\s*[\"\'][^\"\']*[\"\']/gi, 'rel="' + img[0].originalSrc + '"');
                //console.log(replaceImg);
                html = html.replace(m[0], replaceImg);
            } else {
                html = html.replace(m[0], '<p></p>');
            }
            _count++;
            if (_count == 1) {
                IMS.Actions.Waiting("Hệ thống đang xử lý dữ liệu. Xin đợi...", elementWaitingBox);
            }
            if (_count == _max) {
                $(elementWaitingBox).dialog("close");
                $('#cms_bm_contentpaste_waitingbox').parents('.ui-dialog').remove();
                callback(html);
            }
        };

        while (match = imgReg.exec(html)) {
            _max++;
            if (match.length > 1) {
                var file = _max + '-' + match[1].split('/').pop();
                if (file !== null) {
                    PM.Utils.UploadQueue.push({
                        filename: file,
                        url: match[1],
                        match: match
                    });
                } else {

                }
            }
        }
        ProcessNextQueue();

        function ProcessNextQueue() {
            if (PM.Utils.UploadQueue.length > 0) {
                var photo = PM.Utils.UploadQueue.pop();

                //Thử trường hợp abc.jpg?width=600
                var tempUrl = (photo.url + '').split('?')[0];

                function ProcessCurrentQueue(url) {
                    //Gán match hiện tại vào biến (vì đã sử dụng tuần tự (queue) nên có thể dùng 1 biến để lưu match)
                    PM.Utils.CurrentMatch = photo.match;
                    if (PM.NoUploadImageOnDomain.length > 0) {
                        var isUploadPhoto = true;
                        $.each(PM.NoUploadImageOnDomain, function(i, item) {
                            if (photo.url.startsWith(item)) {
                                isUploadPhoto = false;
                                photo.url = photo.url.replace(/thumb_w\/\w+\//, '');
                                photo.url = photo.url.replace(item, '');
                            }
                        });
                        if (isUploadPhoto) {
                            photo.url = photo.url.replace(cms_bm_host_avatar, '');
                            PM.Utils.UploadAndSaveToPhotoThenClone(photo.filename, photo.url, function(img, imgClient) {
                                _funcPrivate(imgClient, PM.Utils.CurrentMatch);
                                ProcessNextQueue();
                            });
                        } else {
                            PM.Utils.CreatePhotoAndClone(photo.fileName, photo.url, function(arrImage) {
                                _funcPrivate(arrImage, PM.Utils.CurrentMatch);
                                ProcessNextQueue();
                            });
                        }
                    } else {
                        PM.Utils.UploadAndSaveToPhotoThenClone(photo.filename, photo.url, function(img) {
                            _funcPrivate(img, PM.Utils.CurrentMatch);
                            ProcessNextQueue();
                        });
                    }
                }

                PM.Utils.CheckImageLoaded(tempUrl, {
                    success: function() {
                        ProcessCurrentQueue(tempUrl);
                    },
                    failure: function() {
                        //Nếu không được thì upload với url gốc: abc.jpg.ashx?width=600
                        //http://www.tienphong.vn/Kinh-Te/nam-hoi-nhap-2015-ai-ho-tro-thuc-tinh-doanh-nghiep-827657.tpo
                        tempUrl = (photo.url + '');
                        PM.Utils.CheckImageLoaded(tempUrl, {
                            success: function() {
                                ProcessCurrentQueue(tempUrl);
                            },
                            failure: function() {
                                ProcessNextQueue();
                            }
                        });
                    }
                });

            }
        }
        if (_max == 0) {
            callback(html); // nếu callback chỗ này sảy ra tình trạng thừa chữ undefined ở editor vì đã chạy vào file vcimageupload trước.
        }
    };

    return Utils;
});
//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\src\plugins\photo-manager\mobile\templates\list-mobile-photos.js
this["IMSPluginTemplate"] = this["IMSPluginTemplate"] || {};
this["IMSPluginTemplate"]["photo-manager"] = this["IMSPluginTemplate"]["photo-manager"] || {};
this["IMSPluginTemplate"]["photo-manager"]["list-mobile-photos"] = {"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3=container.escapeExpression, alias4="function";

  return "        <div    class=\"PMPhotoItem  {0} "
    + alias3((helpers.classPhoto || (depth0 && depth0.classPhoto) || alias2).call(alias1,(depth0 != null ? depth0.image_url : depth0),{"name":"classPhoto","hash":{},"data":data}))
    + "\"\r\n                data-id=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" \r\n                data-w=\""
    + alias3((helpers.widthPhoto || (depth0 && depth0.widthPhoto) || alias2).call(alias1,(depth0 != null ? depth0.size : depth0),{"name":"widthPhoto","hash":{},"data":data}))
    + "\" \r\n                data-h=\""
    + alias3((helpers.heightPhoto || (depth0 && depth0.heightPhoto) || alias2).call(alias1,(depth0 != null ? depth0.size : depth0),{"name":"heightPhoto","hash":{},"data":data}))
    + "\" \r\n                data-originalSrc=\""
    + alias3(((helper = (helper = helpers.image_url || (depth0 != null ? depth0.image_url : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"image_url","hash":{},"data":data}) : helper)))
    + "\" \r\n                data-name=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">\r\n            <div>\r\n                <div class=\"PMDbClick\" title=\"Chèn ảnh\">\r\n                    <i class=\"fa fa-check\"></i>\r\n                </div>\r\n                \r\n                <div class=\"PMPhotoAvatarWrapper\">\r\n                    "
    + ((stack1 = (helpers.iconPhoto || (depth0 && depth0.iconPhoto) || alias2).call(alias1,(depth0 != null ? depth0.image_url : depth0),{"name":"iconPhoto","hash":{},"data":data})) != null ? stack1 : "")
    + "\r\n                    <img src=\""
    + alias3((helpers.linkPhotoForList || (depth0 && depth0.linkPhotoForList) || alias2).call(alias1,(depth0 != null ? depth0.image_url : depth0),140,{"name":"linkPhotoForList","hash":{},"data":data}))
    + "\"/>\r\n                </div>\r\n                <h3 class=\"PMPhotoTitle\">"
    + alias3((helpers.namePhoto || (depth0 && depth0.namePhoto) || alias2).call(alias1,(depth0 != null ? depth0.name : depth0),(depth0 != null ? depth0.image_url : depth0),{"name":"namePhoto","hash":{},"data":data}))
    + "</h3>\r\n                <span class=\"PMSelectedNumber\"></span>\r\n            </div>\r\n        </div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.listPhoto : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true};
//F:\VCcorp\Project\IMS.MAIN\IMS.Plugins\src\plugins\photo-manager\mobile\templates\template-photo-mobile-manager.js
this["IMSPluginTemplate"]["photo-manager"]["template-photo-mobile-manager"] = {"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div id=\"PMTabPhotoMobileFunc\" class=\"IMSTabFunction\">\r\n    <ul>\r\n        <li data-tab=\"list-photo\" class=\"active\" title=\"Danh sách ảnh\">\r\n            <div>\r\n                <i class=\"fa fa-photo\"></i>\r\n                <b>Danh sách ảnh</b>\r\n            </div>\r\n            <span class=\"ims-arrow\"></span>\r\n        </li>\r\n\r\n        <li data-tab=\"upload\" id=\"PMUploadFromPc\" title=\"Upload từ máy\">\r\n            <div>\r\n                <i class=\"fa fa-cloud-upload\"></i>\r\n                <b>Upload từ máy</b>\r\n                <!--<input type=\"file\" id=\"PMUploadInput\" multiple=\"multiple\" />-->\r\n                <input id=\"PMHtml5UploadInput\" multiple=\"multiple\" type=\"file\" name=\"filedata\" accept=\""
    + alias4(((helper = (helper = helpers.FILE_ACCEPT || (depth0 != null ? depth0.FILE_ACCEPT : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"FILE_ACCEPT","hash":{},"data":data}) : helper)))
    + "\" data-url=\""
    + alias4(((helper = (helper = helpers.FILE_MANAGER_HTTPSERVER || (depth0 != null ? depth0.FILE_MANAGER_HTTPSERVER : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"FILE_MANAGER_HTTPSERVER","hash":{},"data":data}) : helper)))
    + "upload\">\r\n            </div>\r\n            <span class=\"ims-arrow\"></span>\r\n        </li>\r\n\r\n\r\n    </ul>\r\n</div>\r\n<div id=\"PMTabPhotoMobileContent\" class=\"IMSTabContent\">\r\n    <div data-tab=\"list-photo\" class=\"active\">\r\n\r\n        <div id=\"PMTabMobilePhoto\">\r\n\r\n            <div class=\"xpull\">\r\n                <div class=\"xpull__start-msg\">\r\n                    <div class=\"xpull__start-msg-text\">Pull Down &amp; Release to Refresh</div>\r\n                    <div class=\"xpull__arrow\"></div>\r\n                </div>\r\n                <div class=\"xpull__spinner\">\r\n                    <div class=\"xpull__spinner-circle\"></div>\r\n                </div>\r\n            </div>\r\n\r\n            <div id=\"PMListMobilePhoto\">\r\n\r\n            </div>\r\n        </div>\r\n        <div id=\"PMFooterMobilePhoto\">\r\n            <button id=\"PMMobilePhotoInsert\" class=\"PMBtn blue\"><i class=\"fa fa-arrow-circle-o-down\"></i>Chèn ảnh</button>\r\n        </div>\r\n    </div>\r\n\r\n    <div data-tab=\"upload\">\r\n        <div id=\"PMUploadWrapper\">\r\n            <ul>\r\n                <!--<div id=\"PMUploadContent\"  class=\"PMUploadItem\">\r\n                    <div id=\"PMUploadDropPLH\">\r\n                        <div>\r\n                            <div id=\"PMUploadInputWrapper\">\r\n                                <span class=\"PMUploadSpan\">Chọn file từ máy</span>\r\n                                <input type=\"file\" id=\"PMUploadInput\" multiple=\"multiple\" accept=\"<%=Accept %>\" />\r\n                            </div>\r\n                            <div id=\"PMUploadByUrl\">\r\n                                <i class=\"fa fa-upload\"></i>\r\n                                <label>Upload bằng url</label>\r\n                            </div>\r\n                            <div id=\"PMUploadDragDropMessage\">Hoặc kéo thả ảnh vào đây để upload</div>\r\n                            <div id=\"PMUploadStatus\" style=\"display: none;\">Hãy chọn file để tải lên</div>\r\n                        </div>\r\n                    </div>\r\n                    \r\n                </div>-->\r\n            </ul>\r\n        </div>\r\n        <div id=\"PMUploadFooter\">\r\n            <span class=\"PMBtn blue\" id=\"PMInsertUploadedPhoto\">Chèn ảnh vừa upload</span>\r\n        </div>\r\n        <input type=\"hidden\" id=\"VCPhotoManagerBrowseImage\" />\r\n\r\n    </div>\r\n\r\n</div>";
},"useData":true};