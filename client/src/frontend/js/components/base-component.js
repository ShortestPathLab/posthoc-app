let BaseComponent = {
  transitions: [
    {
      name: 'init',
      from: 'none',
      to: 'ready'
    },
    {
      name: 'render',
      from: 'ready',
      to: 'rendered'
    }
  ]
};

export default BaseComponent;
