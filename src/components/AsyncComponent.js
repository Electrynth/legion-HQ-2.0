import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

function asyncComponent(importComponent) {
  class AsyncComponent extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        component: null
      };
    }

    async componentDidMount() {
      const { default: component } = await importComponent();
      this.setState({ component });
    }

    render() {
      const C = this.state.component;
      return C ? <C {...this.props} /> : (
        <div style={{ position: 'relative', textAlign: 'center', top: '20vw' }}>
          <CircularProgress />
        </div>
      );
    }
  }

  return AsyncComponent;
}

export default asyncComponent;
