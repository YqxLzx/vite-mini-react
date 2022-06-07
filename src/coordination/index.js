import { OPERATE_INCREASE, OPERATE_REDUCE, OPERATE_UPDATE } from "../types"

export function coordinationFiberTree(oldFiberTree, newFiberTree) {
    detectDfiff(oldFiberTree, newFiberTree)
}
function detectDfiff(oldFiber, newFiber) {
    let isSameFiber = false
    if (oldFiber.type === newFiber.type) {
        let oldProps = oldFiber.props
        let newProps = newFiber.props
        const filterChildren = key => key !== 'children'
        let oldPropsKeys = Object.keys(oldProps).filter(filterChildren)
        let newPropsKeys = Object.keys(newProps).filter(filterChildren)
        let index = 0
        let maxKeyLen = newPropsKeys.length - oldPropsKeys.length === 0 ? oldPropsKeys.length :
            newPropsKeys.length - oldPropsKeys.length > 0 ? newPropsKeys.length : oldPropsKeys.length
        while (index < maxKeyLen) {
            
            if (oldPropsKeys[index] !== newPropsKeys[index]) {
                logChangeTag(oldFiber,newFiber)
                logUpdate(oldFiber)
            } else if (oldProps[oldPropsKeys[index]] !== newProps[newPropsKeys[index]]) {
                logChangeTag(oldFiber,newFiber)
                logUpdate(oldFiber)
            }
            index++
        }
        let oldChildren = oldProps.children
        let newChildren = newProps.children
        let gap = 0
        if (oldChildren.length === newChildren.length && newChildren.length === 0) {
            return isSameFiber = true
        }
        if (oldChildren.length > newChildren.length) {
            gap = oldChildren.length - newChildren.length
            let i = 0
            while (i < newChildren.length) {
                isSameFiber = detectDfiff(oldChildren[i], newChildren[i])
                i++
            }
            while (i < oldChildren.length) {
                logChangeTag(oldFiber,newFiber,true)
                logReduce(oldChildren[i])
                i++
            }
            return isSameFiber
        } else if (oldChildren.length < newChildren.length) {  // 1 - 3 = -2 增加两个元素
            gap = newChildren.length - oldChildren.length  // 2
            let i = 0
            while (i < oldChildren.length) {
                isSameFiber = detectDfiff(oldChildren[i], newChildren[i])
                i++
            }
            while (i < newChildren.length) {
                logChangeTag(oldFiber,newFiber,true)
                logIncrease(newChildren[i])
                i++
            }
            return isSameFiber
        } else {
            let i = 0
            while (i < newChildren.length) {
                isSameFiber = detectDfiff(oldChildren[i], newChildren[i])
                i++
            }
        }

    } else {
        if (oldFiber === undefined) {
            logChangeTag(oldFiber,newFiber)
            logReduce(oldFiber)
            logIncrease(newFiber)
        }
        if (newFiber === undefined) {
            logChangeTag(oldFiber,newFiber)
            logReduce(newFiber)
            logIncrease(oldFiber)
        }
        if (oldFiber && newFiber) {
            logChangeTag(oldFiber,newFiber)
            logReduce(oldFiber)
            logIncrease(newFiber)
        }

    }
    return isSameFiber
}
function logChangeTag(oldFiber,newFiber,current){
    
    //degugger
    if(current){
        oldFiber.change = true
        newFiber.change = true
    }else{
        oldFiber.partentFiber.change = true
        newFiber.partentFiber.change = true
    }

}

function logReduce(fiber) {
    fiber.operate = OPERATE_REDUCE
}
function logIncrease(fiber) {
    fiber.operate = OPERATE_INCREASE
}
function logUpdate(fiber) {
    fiber.operate = OPERATE_UPDATE
}