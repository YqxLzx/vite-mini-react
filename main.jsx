import './style.css'
import App from './App.jsx'
import { ReactDom } from './src/react-dom'
import { React } from './src/react/index'
import {ReactComponent} from './src/react/classComponent'
class Com extends ReactComponent {
    constructor(){
        super()
        this.state = {count:10}
    }
    render(){
        console.log('render')
        return (
            <div >
               <Com2/> 
                <button onClick={() => {this.setState({count:++this.state.count})}}>setState</button>
                <button onClick={() => console.log(this.state)}>showState</button>
                <h1>count:{this.state.count}</h1>
            </div>
            
        )
    }
}

class Com2 extends ReactComponent {
    render(){
        console.log('com2 rerender')
        return         <div>
        <h1>com2</h1>
    </div>

    }
}
let a = new Com()
console.log(a.render())
let ele = <div>
    <Com/>
</div>
let rootDom = document.getElementById('app')
ReactDom.render(ele,rootDom)


