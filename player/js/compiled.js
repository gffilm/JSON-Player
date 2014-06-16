var jp={};jp.PRODUCTION=!1,window.console||(console={},console.log=function(){}),jp.bindJs=function(t,e){var o,n,s=e||jp.global;return arguments.length>2?(n=Array.prototype.slice.call(arguments,2),function(){return o=Array.prototype.slice.call(arguments),Array.prototype.unshift.apply(o,n),t.apply(s,o)}):function(){return t.apply(s,arguments)}},jp.bindNative=function(t){return t.call.apply(t.bind,arguments)},jp.bind=function(){return jp.bind=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?jp.bindNative:jp.bindJs,jp.bind.apply(null,arguments)},jp.base=function(t,e){var o,n,s,i=arguments.callee.caller;if(i.superClass_)return i.superClass_.constructor.apply(t,Array.prototype.slice.call(arguments,1));for(o=Array.prototype.slice.call(arguments,2),n=!1,s=t.constructor;s;s=s.superClass_&&s.superClass_.constructor)if(s.prototype[e]===i)n=!0;else if(n)return s.prototype[e].apply(t,o);if(t[e]===i)return t.constructor.prototype[e].apply(t,o);throw Error("Base called from a different name than its parent")},jp.inherits=function(t,e){function o(){}o.prototype=e.prototype,t.superClass_=e.prototype,t.prototype=new o,t.prototype.constructor=t},jp.dustHelpers=function(){this.define=function(t,e,o,n){var s,i=n.name,r=(n.rgba,e.get(i)),a=e.get(r);return!a&&r&&(a=r),s=a,t.write(s)}},jp.engine=function(){this.assetPathsLoaded_=0,this.jsonData_={},this.template_,this.utility_=new jp.utility},jp.startup=function(){jp.engineInstance=new jp.engine,jp.engineInstance.init()},jp.restart=function(){var t=document.body.children[0];jp.ui.removeElement(t),jp.engineInstance=null,jp.startup()},jp.engine.prototype.init=function(){var t=this.getAssetPaths();this.totalAssetPaths_=t.length,this.loadJSON(t,jp.bind(this.handleJSONLoad,this))},jp.engine.prototype.getAssetPaths=function(){var t,e=new jp.utility,o=e.getUrlParams("lang")||"en",n=e.getUrlParams("id");return t=["assets/global/js/config.js","assets/"+o+"/js/config.js","assets/"+o+"/js/localization.js"],n&&t.push("../courses/"+n+"/assets/global/js/config.js","../courses/"+n+"/assets/"+o+"/js/config.js","../courses/"+n+"/assets/"+o+"/js/localization.js"),t},jp.engine.prototype.loadJSON=function(t,e){var o,n=t[0];n&&(t.shift(),o=$.getJSON(n,function(o){e(o),this.loadJSON(t,e)}.bind(this)).fail(function(o,s){jp.error(jp.errorCodes.jsonLoad,n+" "+s),this.loadJSON(t,e),e({})}.bind(this)))},jp.engine.prototype.handleJSONLoad=function(t){this.assetPathsLoaded_++,$.extend(this.jsonData_,t),this.totalAssetPaths_===this.assetPathsLoaded_&&this.activate()},jp.engine.prototype.activate=function(){this.title_=this.getConfig(["course","title"]),document.title=this.title_,this.player_=new jp.player("player",this.getJsonData()),this.player_.setTitle(this.title_)},jp.engine.prototype.getJsonData=function(){return this.jsonData_},jp.engine.prototype.getConfig=function(t){return this.utility_.findJsonData(t,this.getJsonData())},jp.events={layoutLoad:"layoutLoad",styleLoad:"styleLoad",styleLoaded:"styleLoaded",elementRendered:"elementRendered",reboot:"reboot"},jp.events.listen=function(t,e,o,n,s){$(t).bind(e,jp.bind(o,n,s))},jp.events.talk=function(t,e){$(t).trigger(e)},jp.logger=function(){},jp.errorCodes={libraryLoad:{code:"loader-001",detail:"Error loading libraries"},jsonLoad:{code:"loader-002",detail:"Error loading json files"},dustError:{code:"dust-001",detail:"Error parsing dust file"},dustMarkup:{code:"dust-002",detail:"Dust markup missing"},layoutMissing:{code:"dust-003",detail:"Dust layout missing"},layoutMissingFromConfig:{code:"dust-004",detail:"Dust layout missing from config"},layoutContentMissing:{code:"dust-005",detail:"Dust layout content missing"},styleMissing:{code:"dust-003",detail:"Dust layout missing"},styleMissingFromConfig:{code:"css-001",detail:"Styles missing"}},jp.error=function(t,e,o){if(e?console.log("Info:",t.detail," Code:",t.code,e):console.log("Info:",t.detail," Code:",t.code),o)throw alert(t.detail+"\n\nErrorCode:"+t.code),Error("Critical error occurred")},jp.log=function(t,e){console.log(t,e)},jp.page=function(t,e){this.utility_=new jp.utility,this.modelName_=t,this.model_=e[t],this.contextName_=this.model_.modelContext,this.modelContext_=this.getConfig([this.contextName_],e),this.title_,this.template_=new jp.template,this.loadStyles(),this.loadLayouts(),jp.events.listen(this.template_,jp.events.styleLoad,this.renderStyle,this),jp.events.listen(this.template_,jp.events.layoutLoad,this.renderLayout,this),jp.events.listen(this.template_,jp.events.elementRendered,this.activate,this)},jp.page.prototype.loadStyles=function(){this.template_.renderJsonStyles(this.modelName_,this.getModel());var t,e=this.template_.getStyles(),o=e.length;if(e)for(t=0;o>t;t++)this.template_.loadStyle(this.modelName_,"assets/global/styles/"+e[t]+".css");else jp.error(jp.errorCodes.styleMissingFromConfig)},jp.page.prototype.loadLayouts=function(){this.template_.renderJsonLayouts(this.modelName_,this.getModel()),this.template_.getLayout()?this.template_.loadLayout(this.modelName_,"assets/global/layouts/"+this.template_.getLayout()+".html"):jp.error(jp.errorCodes.layoutMissingFromConfig)},jp.page.prototype.renderLayout=function(){this.template_.renderLayout(this.modelName_)},jp.page.prototype.activate=function(){this.setButtonMap(),this.setButtonEvents(),this.template_.renderDom(),this.setHtml()},jp.page.prototype.setButtonEvents=function(){var t,e,o=this.template_.renderedElement_.getElementsByClassName("button"),n=o.length;for(e=0;n>e;e++)t=o[e],this.matchButtonEvents(t)},jp.page.prototype.setHtml=function(){jp.ui.setHtmlById("title",this.title_)},jp.page.prototype.setButtonMap=function(){this.buttonMap_=this.modelContext_.buttonMap},jp.page.prototype.getButtonMap=function(){return this.buttonMap_},jp.page.prototype.matchButtonEvents=function(t){var e,o,n,s,i=this.getButtonMap(),r=i.length;for(s=0;r>s;s++)n=i[s],n.id===t.id&&(e=n["function"],e&&(o=this[e]||jp[e],o&&this.addOnClickEvent(t,o)))},jp.page.prototype.test=function(t,e){console.log(t,e)},jp.page.prototype.addOnClickEvent=function(t,e){var o=this;$(t).bind("click",function(t){e(t,o)}),$(t).bind("keypress",function(t){(32===t.charCode||"Enter"===t.key)&&e(t,o)})},jp.page.prototype.renderDom=function(){this.template_.renderDom()},jp.page.prototype.loadStyle=function(){this.template_.loadStyle(this.modelName_)},jp.page.prototype.renderStyle=function(){this.template_.renderStyle(this.modelName_)},jp.page.prototype.getModel=function(){return this.model_},jp.page.prototype.setTitle=function(t){this.title_=t},jp.page.prototype.getConfig=function(t,e){return dataModel=e||this.getModel(),this.utility_.findJsonData(t,dataModel)},jp.player=function(t,e){jp.base(this,t,e)},jp.inherits(jp.player,jp.page),jp.template=function(){this.layout_,this.layoutContent_},jp.template.prototype.setLayout=function(t){this.layout_=t},jp.template.prototype.getLayout=function(){return this.layout_},jp.template.prototype.setLayoutContent=function(t){this.layoutContent_=t},jp.template.prototype.getLayoutContent=function(){return this.layoutContent_},jp.template.prototype.setStyle=function(t){this.style_=t},jp.template.prototype.getStyles=function(){return this.style_},jp.template.prototype.setStyleContent=function(t){this.styleContent_=t},jp.template.prototype.getStyleContent=function(){return this.styleContent_},jp.template.prototype.renderJsonLayouts=function(t,e){var o=new jp.utility,n=o.findJsonData([t,"layout"],e);layoutContent=o.findJsonData([t,"layoutContext"],e),this.setLayout(n),this.setLayoutContent(layoutContent)},jp.template.prototype.renderJsonStyles=function(t,e){var o=new jp.utility,n=o.findJsonData([t,"style"],e);styleContent=o.findJsonData([t,"styleContext"],e),this.setStyle(n),this.setStyleContent(styleContent)},jp.template.prototype.loadLayout=function(t,e){var o,n=function(e){o=dust.compile(e,t),dust.loadSource(o),jp.events.talk(this,jp.events.layoutLoad)}.bind(this);$.get(e,n).fail(function(){jp.error(jp.errorCodes.layoutMissing)})},jp.template.prototype.renderLayout=function(t){var e,o=jp.engineInstance.getJsonData(),n=this.getLayoutContent(),s=o[n];callback=function(t,o){return t?void jp.error(jp.errorCodes.dustError,t):(e=this.convertLayoutToNode(o),void(e&&(this.renderedElement_=e,jp.events.talk(this,jp.events.elementRendered))))}.bind(this),s?dust.render(t,s,callback):jp.error(jp.errorCodes.dustMarkup)},jp.template.prototype.renderDom=function(){$("body").append(this.renderedElement_)},jp.template.prototype.convertLayoutToNode=function(t){var e=document.createElement("div");if(e.innerHTML="<br>"+t,e.removeChild(e.firstChild),1==e.childNodes.length)return e.removeChild(e.firstChild);for(element=document.createDocumentFragment();e.firstChild;)element.appendChild(e.firstChild);return element},jp.template.prototype.loadStyle=function(t,e){var o,n=function(e){o=dust.compile(e,t),dust.loadSource(o),jp.events.talk(this,jp.events.styleLoad)}.bind(this);$.get(e,n).fail(function(){jp.error(jp.errorCodes.styleMissing)})},jp.template.prototype.renderStyle=function(t){var e=jp.engineInstance.getJsonData(),o=this.getStyleContent(),n=e[o],s=this.getDustHelpers();callback=function(t,e){return t?void jp.error(jp.errorCodes.dustError,t):void this.addCssText(e)}.bind(this),n?($.extend(n,s),dust.render(t,n,callback)):jp.error(jp.errorCodes.dustMarkup,t)},jp.template.prototype.getCssNode=function(){if(this.cssNode_)return this.cssNode_;var t=document.createElement("style"),e=document.getElementsByTagName("head")[0];return t.type="text/css",e.appendChild(t),this.cssNode_=t,mynode=this.cssNode_,this.cssNode_},jp.template.prototype.addCssText=function(t){var e=this.getCssNode(),o=document.createTextNode(t);e.styleSheet?e.styleSheet.cssText+=t:e.appendChild(o),jp.events.talk(this,jp.events.styleLoaded)},jp.template.prototype.getDustHelpers=function(){var t=new jp.dustHelpers;return t},jp.ui=function(){},jp.ui.setHtmlById=function(t,e){$("#"+t).html(e)},jp.ui.createElement=function(t,e,o,n){return jQuery("<"+t+">",{id:e,text:n,"class":o})},jp.ui.removeElement=function(t){try{t.remove()}catch(e){t.parentNode.removeChild(t)}},jp.utility=function(){},jp.utility.prototype.getUrlParams=function(t){return decodeURIComponent((new RegExp("[?|&]"+t+"=([^&;]+?)(&|#|;|$)").exec(location.search)||[,""])[1].replace(/\+/g,"%20"))||null},jp.utility.prototype.findJsonData=function(t,e){var o,n,s=!1;for(o in t)n=t[o],e[n]&&(e=e[n],s=!0);return s?e:null};