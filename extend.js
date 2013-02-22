var UA = (function(){
	var ua = navigator.userAgent,
		isIE = /msie/i.test(ua),
		isIElt9 = (!-[1,]),
		isIE6 = /msie 6/i.test(ua),
		isFF = /firefox/i.test(ua);
	return{
		'ua' : ua,
		'isIE' : isIE,
		'isIElt9' : isIElt9,
		'isIE6' : isIE6,
		'isFF' : isFF
	}
})();

var isDOMs = function(target){
	// var targetType = Object.prototype.toString.call(target);
	// return (targetType === "[object HTMLCollection]" || 
	// targetType === "[object NodeList]" || 
	// targetType === "[object Array]");
	return target.length && target !== window && target.tagName != "select";
};

(function(win){
	/*
	* 一些操作DOM的方法兼容。置于window对象下
	*/
	win.$id = function (id) {
		return "string" == typeof id ? document.getElementById(id) : id;
	};
	/*
	* 兼容浏览器的getElementsByClassName方法
	* 使用：$class(class名,父级元素,标签名); //后两个参数可省略
	*/
	win.$class = function(className) {
		var parent = arguments[1] || document;  //参数2: 父级元素，缺省为document
	    if(isDOMs(parent)) {
	    	var nodes =[];
			for(var i=0, l = parent.length; i < l; i++){
				var elms = get(parent[i]);
				for (var j = elms.length - 1; j >= 0; j--) {
					nodes.push(elms[j])
				};
			}
			return nodes;
		}else{
			return get(parent);
		};
	    function get(parent){
			if(parent.getElementsByClassName){ //ie8以下不支持
		        return  parent.getElementsByClassName(className);
		    }else{   
		       var tag = arguments[2] || '*'; //参数3: 元素标签名，缺省为*
		        var returnElements = []
		        var els =  parent.getElementsByTagName(tag);
		        className = className.replace(/\-/g, "\\-");
		        var pattern = new RegExp("(^|\\s)"+className+"(\\s|$)");
				var i = 0;
		        while(i < els.length){
		            if (pattern.test(els[i].className) ) {
		                returnElements.push(els[i]);
		            }
					i++;
		        }
		        return returnElements; //注意，此时返回的是数组，和原生方法返回的对象还是有差别的。
		    }
		}
	}

	/*
	 * 扩展getElementsByTagName方法，支持简单的属性选择器
	 * 使用：$tag(tag[属性=属性名],父级元素); //父级元素可省略，支持写上[属性=属性名]附加属性过滤
	 */
	win.$tag = function(tagName){
		var parent = arguments[1] || document;  //参数2，父级元素
			// 匹配"span"=>span; "span[name]" => span, name; "span[name=me]" => span, name, me; 
			tagName = tagName.match(/^([^\[\]]+)\[?([^=\]]*)=?([^\]]*)\]?$/);

	 	var els = null;
		if(isDOMs(parent)) {
	    	var nodes =[];
			for(var i=0, l = parent.length; i < l; i++){
				var els = parent[i].getElementsByTagName(tagName[1]);
				for (var j = els.length - 1; j >= 0; j--) {
					nodes.push(els[j]); 
				};
			}
			els = nodes;
		}else{
			els = parent.getElementsByTagName(tagName[1]);
		};	
		var attrKey = tagName[2];
		if(attrKey){
			var attrValue = tagName[3];
			var i = 0, thisAttrValue, returnElements = [];
	        while(i < els.length){
				thisAttrValue = els[i].getAttribute(attrKey);
	            if ((thisAttrValue && !attrValue) ||  thisAttrValue == attrValue) {
	                returnElements.push(els[i]);
	            }
				i++;
	        }
	        return returnElements;
		}else{
			return els;	
		}
	}

	/*
	 *addClass & removeClass方法
	 */
	win.hasClass = function(target,className){
		if(!target) return false;
		if(target[0]) target = target[0];
		var pattern = new RegExp("(^|\\s)"+className+"(\\s|$)");
		return pattern.test(target.className);
	}

	win.addClass = function(target,className){
		if(!target) return false;
		var add = function(o){
			if (!hasClass(o,className))
			{
				 o.className += " " + className;
			}
		}
		if(isDOMs(target)) {
			for(var i=0, l = target.length; i < l; i++){
				add(target[i])
			}
		}else{
			add(target);
		}
	}

	win.removeClass = function(target,className){
		if(!target) return false;
		var pattern = new RegExp("(^|\\s)"+className+"(\\s|$)");	
		var remove = function(o){
			o.className = o.className.replace(pattern,'');
		}
		if(isDOMs(target)) {
			/* 考虑到remove("box","box")这种情况 */
			var arr = [];
			for(var i = 0, l = target.length; i < l; i++ ){
				arr.push(target[i]);
			}
			for(var i = 0, l = arr.length; i < l; i++ ){
				remove(arr[i]);
			}
		}else{
			remove(target);
		}
	}

	/* 兼容ie6/7 的JSON方法 */
	if (!win.JSON) {
	    win.JSON = {
	    //不支持reviver参数
	    parse: function (sJSON) { 
	    	var rvalidchars = /^[\],:{}\s]*$/,
				rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
				rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
				rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
	    	if ( typeof sJSON !== "string" || !sJSON ) {
				return null;
			}
			if ( rvalidchars.test(sJSON.replace(rvalidescape, "@")
				.replace( rvalidtokens, "]" )
				.replace( rvalidbraces, "")) ) {
				return ( new Function( "return " + sJSON ) )();
			}
	    },
	    stringify: function (vContent) {
	      if (vContent instanceof Object) {
	        var sOutput = "";
	        if (vContent.constructor === Array) {
	          for (var nId = 0; nId < vContent.length; sOutput += this.stringify(vContent[nId]) + ",", nId++);
	          return "[" + sOutput.substr(0, sOutput.length - 1) + "]";
	        }
	        if (vContent.toString !== Object.prototype.toString) { return "\"" + vContent.toString().replace(/"/g, "\\$&") + "\""; }
	        for (var sProp in vContent) { sOutput += "\"" + sProp.replace(/"/g, "\\$&") + "\":" + this.stringify(vContent[sProp]) + ","; }
	        return "{" + sOutput.substr(0, sOutput.length - 1) + "}";
	      }
	      return typeof vContent === "string" ? "\"" + vContent.replace(/"/g, "\\$&") + "\"" : String(vContent);
	    }
	  };
	}
	
	 if (!win.$jsonp) {
		//jsonp的具体实现
	  	var randomNum = (new Date).getTime(),
	  		callName = null,
	  		sendScriptRequest = function(url,id){
	  			//将请求地址以script标签形式插入到页面。（注定是GET请求）
		        var head = document.getElementsByTagName("head")[0];
		        var script = document.createElement("script");
		        script.id = id;
		        script.src = url;
		        script.charset = 'utf-8';
		        head.appendChild(script);
		    },
		    buildTempFunction = function(callback){
		    	//创建一个全局方法，并将方法名当做请求地址的一个参数
		        callName = "jsonp" + randomNum++;
		        window[ callName ] = function(data){
		            callback(data);
		            window[ callName ] = undefined;
		            try{ 
		            	delete window[ callName ]; 
		            	//var jsNode = document.getElementById(callName); 
		            	//jsNode.parentElement.removeChild(jsNode);  //执行全局方法后，将script标签删除
		            } catch(e){}
		        };
		        return callName;
		    };
	    win.$jsonp = function(url,params){
	    	//生成GET请求地址
	  		params.callback = buildTempFunction(params.callback);
	  		url += (url.indexOf("?")>0 ) ? "" : "?" ;
	  		for(var i in params)
	  			url += "&" + i + "=" + params[i];
		    sendScriptRequest(url,callName);
	  	};
	 }
	
})(window)


/* 浅拷贝 */
function extendCopy(p, c) {
　　　　var c = c || {};
　　　　for (var i in p) { 
　　　　　　c[i] = p[i];
　　　　}
　　　　c.uber = p;
　　　　return c;
　　}

/* 深拷贝*/
function deepCopy(p, c) {
　　　　var c = c || {};
　　　　for (var i in p) {
　　　　　　if (typeof p[i] === 'object') {
　　　　　　　　c[i] = (p[i].constructor === Array) ? [] : {};
　　　　　　　　deepCopy(p[i], c[i]);
　　　　　　} else {
　　　　　　　　　c[i] = p[i];
　　　　　　}
　　　　}
　　　　return c;
　　}

/* 
*  事件方法扩展：
* events.addEvent(元素，事件类型，方法);  支持对象数组的集体绑定,支持mouseenter，mouseleave事件类型
* events.removeEvent(元素，事件类型，方法);
* events.delegate(委托元素, 触发元素, 事件类型, 方法);
* events.undelegate(委托元素, 触发元素, 事件类型, 方法);
*/
window.events = {}
events._deleFn = {}; //保存delegate所绑定的方法	
events._mouseFn ={}; //保存“onmouseenter”和“onmouseleave”所绑定的方法

events._mouseHandle = function(fn){
	/* 实现mouseenter/leave 的转换方法，符合条件时才会执行 */
	var func = function(event){
		var target = event.target;
		var parent = event.relatedTarget; //在onmouseover/out操作中，相关的另一个节点
		while( parent && parent != this ){  
			try{ parent = parent.parentNode; }
			catch(e){break;}
		}
		/* 只有当相关节点的父级不会是绑定的节点时（即二者不是父子的包含关系），才调用fn，否则不做处理 */
		( parent != this ) && (fn.call(target,event));
	};
	return func;
}

events._delegateHandle = function(obj,elm,fn){
	/* 实现delegate 的转换方法，符合条件时才会执行 */
	var func = function(event){
		var event = event || window.event;
		var target = event.srcElement || event.target;
		var parent = target;

		function contain(item,list){
			/* item对象是否就是list对象 */
			if(list.length == undefined ) return (item === list);
			
			/* item对象是否是list对象数组中的一个 */
			for(var i=0, l = list.length; i < l; i++){
				if(item === list[i]) return true;
			}
			return false;
		}

		while(parent){
			/* 如果触发的元素，属于绑定元素(elm)的子级。 */
			if(contain(parent,elm)){
				if(event.type == 'mouseover' || event.type == 'mouseout'){
					/* 
					* 将mouseover/out直接处理成mouseenter/leave: 事件相关元素不属于绑定元素的子级，才绑定方法 
					*/
					//事件相关元素。ie下使用toElement和fromElement，其他用relatedTarget。
					var related = event.relatedTarget || ((event.type == 'mouseout') ? event.toElement : event.fromElement); 
					if(contain(target,elm) && contain(related,elm)) {
						/* 如果，触发元素和相关元素都属于绑定元素(elm)。执行方法 */
						fn.call(obj,event);
						return;
					}
					while( related && !contain(related,elm)){  
						  related = related.parentNode; 
					}
					/* 事件相关元素，不属于绑定元素(elm)的子级，执行方法  */
					!contain(related,elm) && (fn.call(obj,event));
				}else{
					fn.call(obj,event);
				}
				return;
			}
			parent = parent.parentNode;	
		}
	};
	return func;
};

events.addEvent = function(target,type,fn ) {
	if (!target) return false;
	var add = function(obj){
		if(obj.addEventListener)
	    {	
			if(obj.onmouseenter !== undefined){
				//for opera11，firefox10。他们也支持“onmouseenter”和“onmouseleave”，可以直接绑定
				obj.addEventListener(type,fn,false);  
				return ;
			}
			if(type=="mouseenter" || type=="mouseleave" ){  
				var eType = (type=="mouseenter") ? "mouseover" : "mouseout";
				var fnNew = events._mouseHandle(fn);
				obj.addEventListener(eType,fnNew,false);
				 /* 将方法存入events._mouseFn，以便以后remove */
				if(!events._mouseFn[obj]) events._mouseFn[obj] = {};
				if(!events._mouseFn[obj][eType]) events._mouseFn[obj][eType] = {};
					events._mouseFn[obj][eType][fn] = fnNew;
			}else{
				obj.addEventListener(type,fn,false);
			}
	    }else{
			// for ie ，弃用attachEvent
			var ieType = "_" + type;
			if(!obj[ieType]){
				obj[ieType] = [];
			}
			for(var i in obj[ieType]){
				if(obj[ieType][i] == fn){
					return; //不重复绑定相同方法
				}
			}
			obj[ieType].push(fn);
			obj["on"+type] = function(){
				for (var i = this[ieType].length - 1; i >= 0; i--) {
					this[ieType][i].apply(this,arguments);
				};
			}	
	    }
	}
	if(isDOMs(target)) {
		for(var i=0, l = target.length; i < l; i++){
			add(target[i])
		}
	}else{
		add(target);
	}
};

events.removeEvent = function(target,type,fn ) {
	if (!target) return false;
    var remove = function(obj){
    	if(obj.addEventListener)
	    {	
			if(obj.onmouseenter !== undefined){
				obj.removeEventListener(type,fn,false);  
				return ;
			}
			if(type=="mouseenter" || type=="mouseleave" ){  
				var eType = (type=="mouseenter") ? "mouseover" : "mouseout";
				if(!events._mouseFn[obj][eType][fn]) return;
				obj.removeEventListener(eType,events._mouseFn[obj][eType][fn],false);
				events._mouseFn[obj][eType][fn]={};
			}else{
				obj.removeEventListener(type,fn,false);
			}
	    }
	    else{
			if (!obj || !obj["_"+type]) return false;
			obj["_"+type].Remove(fn);
	    }
    }
    if(isDOMs(target)) {
		for(var i=0, l = target.length; i < l; i++){
			remove(target[i])
		}
	}else{
		remove(target);
	}
};

events.delegate = function(obj,elm,type,fn){
	if (!obj || !elm) return false;
	var fnNew = events._delegateHandle(obj,elm,fn);
	events.addEvent(obj,type,fnNew);
	/* 将绑定的方法存入events._deleFn，以便之后解绑操作 */
	if(!events._deleFn[elm]) events._deleFn[elm] = {};
	if(!events._deleFn[elm][type]) events._deleFn[elm][type] = {};
	events._deleFn[elm][type][fn] = fnNew;
};

events.undelegate = function(obj,elm,type,fn){
	if (!obj || !elm) return false;
	var fnNew = events._deleFn[elm][type][fn];
	if(!fnNew) return;
	events.removeEvent(obj,type,fnNew);
	events._deleFn[elm][type][fn] = null;
};


/*
*  数组常用方法兼容性扩展。
*  indexOf,filter,map
*  Min,Max,RemoveExists,Remove
*/

/*  indexOf方法 */
if (!Array.prototype.indexOf)
{
	Array.prototype.indexOf = function(val) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (this[i] == val) return i;
            }
            return -1;
        };
}

/* filter方法 */
if (!Array.prototype.filter)
{
    Array.prototype.filter = function(fun /*, thisp*/)
    {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        var res = new Array();
        var thisp = arguments[1];
        for (var i = 0; i < len; i++)
        {
            if (i in this)
            {
                var val = this[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, this))
                    res.push(val);
            }
        }
        return res;
    };
}

/*  map方法 */
if (!Array.prototype.map)
{
    Array.prototype.map = function(fun /*, thisp*/)
    {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++)
        {
            if (i in this)
                res[i] = fun.call(thisp, this[i], i, this);
        }
        return res;
    };
}

/* 数组max/min方法 */
Array.prototype.Min = function(){ 
	return Math.min.apply({},this); 
};

Array.prototype.Max = function(){ 
	return Math.max.apply({},this); 
};

/* 数组去重 */
Array.prototype.RemoveExists=function(){
	var newArray=[];
	var provisionalTable = {};
	for (var i = 0, item; (item= this[i]) != null; i++) {
        if (!provisionalTable[item]) {
            newArray.push(item);
            provisionalTable[item] = true;
        }
    }
    return newArray;
};

/*  数组删除特定值 */
Array.prototype.Remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

