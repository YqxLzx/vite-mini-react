import { beginUpdate } from "../scheduler"

export class ReactComponent{
    constructor(){
        this.state = {}
    }
    setState(value){
        //console.log(value)
        this.state = value
        beginUpdate()
        //this.render()
    }
    render(){
        
    }
}

export function resloveReactComponentFiber(fiber){
    let instance = new fiber.type()
    let element = instance.render()
    return {
        element,
        instance
    }
}

export function rerenderClassComponent(fiber){
    let ele
    if(fiber.org){
        let len = fiber.props.children.length
        let classComChildren = []
        let classComIndexs = []
        if(len > 0){
            for(let i = 0 ; i < len ; i++){
                if(fiber.props.children[i].org){
                    classComIndexs.push(i)
                    classComChildren.push(fiber.props.children[i])
                }
            }
        }
        ele = fiber.org.render()
        for(let i = 0 ; i < classComIndexs.length ; i++){
            if(classComIndexs.includes(i)){
                ele.props.children[i] = classComChildren[i]
            }
            
        }
    }
    return ele
}

