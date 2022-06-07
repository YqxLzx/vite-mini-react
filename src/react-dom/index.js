import { TEXT_ELEMENT } from '../types/index'
import { isFunctionComponent , isClassComponent } from '../tools/index'
import {beginWork} from '../scheduler/index'
import { ReactComponent, resloveReactComponentFiber } from '../react/classComponent'
export const ReactDom = {
  render
}

let rootFiber = {
  currentFiberTree:null
}
let beforeUpdateFiberTree = {

}

function deepResoloveClassCom(elementTree){
  if(elementTree.props.children.length > 0){
    let children = elementTree.props.children
    let resoloveTree = children.map(child => {
      if(isClassComponent(child)){
        let {element,instance} = resloveReactComponentFiber(child)
        element.org = instance
        return element
      }else{
        return child
      }
    });
    elementTree.props.children = resoloveTree
    resoloveTree.forEach(child => {
      deepResoloveClassCom(child)
    })
    
  }else{
    return
  }
}
function render(element, container) {
  deepResoloveClassCom(element)
  if(isClassComponent(element)){
    let com = new element.type()
    render(com,container)
    return
  }
  
  if(rootFiber.currentFiberTree === null){
    rootFiber = {
      partentDom:container,
      ...element,
      isRootFiber:true,
      currentFiberTree:element
    } 

    beginWork(rootFiber)
  }else{
    beforeUpdateFiberTree = {
      partentDom:container,
      ...element,
      isRootFiber:true,
    }
    beginWork(beforeUpdateFiberTree)
  }
}
