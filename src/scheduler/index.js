import { OPERATE_INCREASE, OPERATE_REDUCE, OPERATE_UPDATE, TEXT_ELEMENT } from '../types/index'
import {coordinationFiberTree} from '../coordination/index'
import {  deepCopy, deepAssign , deepmerge } from '../tools'
import { rerenderClassComponent, resloveReactComponentFiber } from '../react/classComponent'
let nextUnitOfWork = null
let sourceFiberTree 
let beforeUpdateFiberTree
let prePropsChildren

function assign(targetArr,sourceArr){
    //////debugger
    let maxLen = targetArr.length - sourceArr.length > 0 ? targetArr.length : sourceArr.length
    let index = 0
    let arr = []
    while(index < maxLen){
        arr.push(Object.assign(targetArr[index],sourceArr[index]))
        if(arr[index].props.children.length > 0){

        }
        index++
    }  
    return arr
}

function classComrerender(fiber){
    if(fiber.org){
        let ele = rerenderClassComponent(fiber)
        //debugger
        prePropsChildren = fiber.props
        //let ele = fiber.org.render()
        //debugger
        //let a = deepAssign(prePropsChildren,ele.props.children)
        let a = deepAssign(prePropsChildren,ele.props)  
        fiber.props = a
        //debugger
        ////debugger //////debugger
    }
    if(fiber.props.children.length > 0){
        fiber.props.children.forEach(child => {   
            classComrerender(child)
        })
    }
    return fiber 
}
export function beginUpdate(){
    
    let d = deepCopy(sourceFiberTree)
    //debugger
    let a = classComrerender(d) 
    //debugger
    ////debugger
    console.log(a === d)
    console.log(a === sourceFiberTree)
    
    //classComrerender(sourceFiberTree)
    //nextUnitOfWork = a
    beginWork(a)  
}
export function beginWork(workFiber){
    ////debugger
    if(!isMounted){
        //debugger
        nextUnitOfWork = sourceFiberTree = workFiber
    }else{    
        beforeUpdateFiberTree = workFiber
    }
    requestIdleCallback(intoWorkLoop)
}
let isMounted = false
function intoWorkLoop(deadline){
    let shouldYield = false
    while(!shouldYield && nextUnitOfWork){
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }
    if(isMounted && beforeUpdateFiberTree){
        //degugger
        if(beforeUpdateFiberTree){
            
            console.log(sourceFiberTree === beforeUpdateFiberTree)
            ////debugger
            coordinationFiberTree(sourceFiberTree,beforeUpdateFiberTree)
            console.log(sourceFiberTree,beforeUpdateFiberTree)
            ////debugger
            diffTree(sourceFiberTree,beforeUpdateFiberTree)
            sourceFiberTree = beforeUpdateFiberTree
            //degugger
            beforeUpdateFiberTree = null
            //return
        }
    }
    //mount
    if(!nextUnitOfWork && !isMounted){
        shouldYield = true
        isMounted = true
        commitFiberTree(sourceFiberTree)
    }
    console.log('loop')
    requestIdleCallback(intoWorkLoop)
}

function createDom(fiber){
    let dom = fiber.type === TEXT_ELEMENT ? document.createTextNode("") : document.createElement(fiber.type)
    dom = attchProps(dom,fiber)
    return dom
}

function attchProps(dom,fiber){
    let props = fiber.props
    for(const key in props){
        if(key === 'children'){
            //do nothing
        }else{
            if(dom.nodeName === '#text'){
                dom.nodeValue = props[key]
            }else{
                if(key.startsWith('on')){
                    let event = key.slice(2,key.length).toLocaleLowerCase()
                    dom.addEventListener(event,props[key])
                    
                }else{
                    dom.setAttribute(key,props[key])
                }
               
            }
        }
    }
    return dom
}

function commitFiberTree(fiber,partentDom = fiber.partentDom){ 
    commitFiber(fiber.child)
    partentDom.appendChild(fiber.dom)
    //degugger
}

function commitFiber(fiber){
    let willMountFiber = fiber
    let partentDom = fiber.partentDom
    partentDom.appendChild(fiber.dom) 
    if(willMountFiber.child){
        commitFiber(fiber.child)
    }else{
        while(willMountFiber){
            if(willMountFiber.sibling){
                commitFiber(willMountFiber.sibling)
            }
            willMountFiber = willMountFiber.partentFiber
        }
    }
}

function performUnitOfWork(nextUnitOfWork){
    let dom
    if(!nextUnitOfWork.dom){
        
        dom = createDom(nextUnitOfWork)
        nextUnitOfWork.dom = dom
    }else{
        dom = nextUnitOfWork.dom
    }
    let children = nextUnitOfWork.props.children
    let index = 0
    let prevSibling = null 
    while(index < children.length){
        let newFiber = {
            type:children[index].type,
            props:children[index].props,
            partentDom:dom,
            sibling:null,
            partentFiber:nextUnitOfWork
        }
        if(children[index].org){
            newFiber.org = children[index].org
        }
        children[index] = newFiber
        if(index === 0){ 
            nextUnitOfWork.child = newFiber
        }else{
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber 
        index++
    }
    if(nextUnitOfWork.child){
        return nextUnitOfWork.child
    }
    let nextFiber = nextUnitOfWork
    while(nextFiber){
        if (nextFiber.sibling) {
            return nextFiber.sibling;
          }
        nextFiber = nextFiber.partentFiber;
    } 
}

function diffTree(oldFiber,newFiber){   
    if(oldFiber.change && newFiber.change){
        newFiber.props.children.forEach((child,index) => {
            if(child.child){
                diffTree(child,oldFiber.props.children[index])
            }
            if(child.operate === OPERATE_INCREASE){               
                let dom = createDom(child)
                if(child.props.children){
                    child.props.children.forEach(ele => {
                        dom.appendChild(createDom(ele))
                    })
                }
                oldFiber.dom.appendChild(dom)
            }
        });
        oldFiber.props.children.forEach((child,index) => {
            if(child.child){
                diffTree(child,newFiber.props.children[index])
            }
            
            if(child.operate === OPERATE_REDUCE){        
                oldFiber.dom.removeChild(child.dom)
            }
            if(child.operate === OPERATE_UPDATE && child.type === TEXT_ELEMENT){
                ////debugger
                console.log(child.dom)
                //child.partentDom.innerText = newFiber.props.children[index].props.nodeValue
                child.dom.nodeValue = newFiber.props.children[index].props.nodeValue + ''
                console.log(child.dom.nodeValue)    
                //child.dom.nodeValue =  child.dom.textContent = newFiber.props.children[index].props.nodeValue
                child.props = newFiber.props.children[index].props   
            }
            if(child.operate === OPERATE_UPDATE && child.type !== TEXT_ELEMENT){
                let newProps = newFiber.props.children[index].props
                let oldProps = child.props
                
                for(let key in oldProps){
                    if(key !== 'children'){
                        child.dom.removeAttribute(key)
                    }
                }
                for(let key in newProps){
                    if(key !== 'children' ){
                        child.dom.setAttribute(key,newProps[key])
                        
                    }else{
                        if(key === 'children'){
                            return
                        }
                        child.dom.setAttribute(key,'')
                    } 
                }
            }
        })
    } else {
        if(oldFiber === undefined || newFiber === undefined) return
        let oldFiberChildren = oldFiber.props.children
        let newFiberChildren = newFiber.props.children
        let i = 0
        let maxlen = oldFiberChildren.length > newFiberChildren.length ? oldFiberChildren.length : newFiberChildren.length
        while(i < maxlen){
            diffTree(oldFiberChildren[i],newFiberChildren[i])
            i++
        }        
    } 
}

function mer(o1,o2){
    let o3 = {}

}