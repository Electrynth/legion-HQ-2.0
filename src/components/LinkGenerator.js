import React from 'react';
import DataContext from '../components/DataContext';

class LinkGenerator extends React.Component {
  static contextType = DataContext;

  state = {}

  render() {
    const {
      allCards
    } = this.context;
    const {
      currentList
    } = this.props;
    return (
      <div>
        
      </div>
    );
  }
}

export default LinkGenerator;
