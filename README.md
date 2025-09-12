# @webreflection/element

A minimalistic DOM element creation library.

```js
import element from 'https://esm.run/@webreflection/element';

// element('< body', ...) to use querySelector instead
element(document.body, {
  style: 'text-align: center',
  classList: ['some', 'container'],
  ['custom:event']: {
    handleEvent: ({ type, currentTarget }) => {
      console.log(type, currentTarget);
    },
  },
  ['@click']: [
    ({ type, currentTarget }) => {
      console.log(type, currentTarget);
      currentTarget.dispatchEvent(new Event('custom:event'))
    },
    { once: true },
  ],
  childNodes: [
    element('h1', {
      class: 'name',
      text: '@webreflection/element',
      style: 'color: purple',
      aria: {
        role: 'heading',
        level: 1,
      },
      data: {
        test: 'ok',
      },
      json: {a: 1, b: 2},
      onclick: ({ type, currentTarget }) => {
        console.log(type, currentTarget);
      },
    }),
    element('svg', {
      width: 100,
      height: 100,
      childNodes: [
        element('svg:circle', {
          cx: 50,
          cy: 50,
          r: 50,
          fill: 'violet',
        }),
      ]
    }),
    element('p', {
      html: 'made with ❤️ for the <strong>Web</strong>',
    })
  ]
});
```

**[Live Demo](https://webreflection.github.io/element/)**
