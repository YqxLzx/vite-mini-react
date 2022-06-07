import { ReactComponent } from "../react/classComponent"

export function isFunctionComponent(fiber){
   let isFunCom =  typeof com === 'function' ? true :false
   return isFunCom
}
export function isClassComponent(fiber){
  let isClassCom = false
  if(typeof fiber.type === 'function'){
   isClassCom = true
  }
  return isClassCom
}


export function deepCopy(target) {
  const map = new WeakMap()
  
  function isObject(target) {
    return (typeof target === 'object' && target ) || typeof target === 'function'  
  }

  function clone(data) {
      if (!isObject(data)) {
          return data
      }
      if ([Date, RegExp].includes(data.constructor)) {
          return new data.constructor(data)
      }
      if (typeof data === 'function') {
          return new Function('return ' + data.toString())()
      }
      const exist = map.get(data)
      if (exist) {
          return exist
      }
      if (data instanceof Map) {
          const result = new Map()
          map.set(data, result)
          data.forEach((val, key) => {
              if (isObject(val)) {
                  result.set(key, clone(val))
              } else {
                  result.set(key, val)
              }
          })
          return result
      }
      if (data instanceof Set) {
          const result = new Set()
          map.set(data, result)
          data.forEach(val => {
              if (isObject(val)) {
                  result.add(clone(val))
              } else {
                  result.add(val)
              }
          })
          return result
      }
      const keys = Reflect.ownKeys(data)
      const allDesc = Object.getOwnPropertyDescriptors(data)
      const result = Object.create(Object.getPrototypeOf(data), allDesc)
      
      map.set(data, result)
      keys.forEach(key => {
          const val = data[key]
          if (isObject(val)) {
            if(val instanceof HTMLElement){            
              result[key] = val
            }
            else if(val instanceof ReactComponent ){
              result[key] = val
            }
            else if(val.nodeName === "#text"){
                result[key] = val
            } else{              
              result[key] = clone(val)
            }   
          } else {
              result[key] = val
          }
      })
      return result
  }

  return clone(target)
}


function isObj(x){	
	var type = typeof x;
	return x !== null && (type === 'object' || type === 'function');
}
 
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
 
function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Cannot convert undefined or null to object');
	}
 
	return Object(val);
}
 
function assignKey(to, from, key) {
	var val = from[key];
 
	if (val === undefined || val === null) {
		return;
	}
 
	if (hasOwnProperty.call(to, key)) {
		if (to[key] === undefined || to[key] === null) {
			throw new TypeError('Cannot convert undefined or null to object (' + key + ')');
		}
	}
 
	if (!hasOwnProperty.call(to, key) || !isObj(val)) {
		to[key] = val;
	} else {
		to[key] = assign(Object(to[key]), from[key]);
	}
}
 
function assign(to, from) {
    
	if (to === from) {
		return to;
	}
    
	from = Object(from);
 
	for (var key in from) {
		if (hasOwnProperty.call(from, key)) {
			assignKey(to, from, key);
		}
	}
 
	if (Object.getOwnPropertySymbols) {
		var symbols = Object.getOwnPropertySymbols(from);
 
		for (var i = 0; i < symbols.length; i++) {
			if (propIsEnumerable.call(from, symbols[i])) {
				assignKey(to, from, symbols[i]);
			}
		}
	}
 
	return to;
}
 
export function deepAssign(target) {
	target = toObject(target);
    
	for (var s = 1; s < arguments.length; s++) {
		assign(target, arguments[s]);
	}
    //debugger
	return target;
};


 
function isMergeableObject(val) {
    var nonNullObject = val && typeof val === 'object'
 
    return nonNullObject
        && Object.prototype.toString.call(val) !== '[object RegExp]'
        && Object.prototype.toString.call(val) !== '[object Date]'
}
 
function emptyTarget(val) {
    return Array.isArray(val) ? [] : {}
}
 
function cloneIfNecessary(value, optionsArgument) {
    var clone = optionsArgument && optionsArgument.clone === true
    return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}
 
function defaultArrayMerge(target, source, optionsArgument) {
    var destination = target.slice()
    source.forEach(function(e, i) {
        if (typeof destination[i] === 'undefined') {
            destination[i] = cloneIfNecessary(e, optionsArgument)
        } else if (isMergeableObject(e)) {
            destination[i] = deepmerge(target[i], e, optionsArgument)
        } else if (target.indexOf(e) === -1) {
            destination.push(cloneIfNecessary(e, optionsArgument))
        }
    })
    return destination
}
 
function mergeObject(target, source, optionsArgument) {
    var destination = {}
    if (isMergeableObject(target)) {
        Object.keys(target).forEach(function (key) {
            if(key === 'dom'){         
                destination.dom = target[key]
            }else{
                destination[key] = cloneIfNecessary(target[key], optionsArgument)
            }
           
        })
    }
    Object.keys(source).forEach(function (key) {
        if (!isMergeableObject(source[key]) || !target[key]) {
            destination[key] = cloneIfNecessary(source[key], optionsArgument)
        } else {
            destination[key] = deepmerge(target[key], source[key], optionsArgument)
        }
    })
    return destination
}
 
export function deepmerge(target, source, optionsArgument) {
    
    var array = Array.isArray(source);
    var options = optionsArgument || { arrayMerge: defaultArrayMerge }
    var arrayMerge = options.arrayMerge || defaultArrayMerge
    
    if (array) {
        return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
    } else {
        return mergeObject(target, source, optionsArgument)
    }
}
 
deepmerge.all = function deepmergeAll(array, optionsArgument) {
    if (!Array.isArray(array) || array.length < 2) {
        throw new Error('first argument should be an array with at least two elements')
    }
 
    // we are sure there are at least 2 values, so it is safe to have no initial value
    return array.reduce(function(prev, next) {
        return deepmerge(prev, next, optionsArgument)
    })
}





