import { TEXT_ELEMENT } from '../types/index'
export const React = {
  createElement
}
function createElement(type, props, ...children) {
  let reactElement = {
    type,
    ReactElement:true,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  }
  return reactElement
}
function createTextElement(text) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  }
}