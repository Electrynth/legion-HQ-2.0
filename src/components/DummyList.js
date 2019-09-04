import React from 'react';
import DataContext from '../components/DataContext';

class DummyList extends React.Component {
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
        DummyList
      </div>
    );
  }
}

export default DummyList;
