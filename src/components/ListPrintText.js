import React from 'react';
import QRCode from 'qrcode.react';

class ListPrintText extends React.Component {
  render() {
    const { listTournamentText, listUrl } = this.props;
    return (
      <div style={{ backgroundColor: 'white', width: '100%', height: '100%' }}>
        <div>
          <div style={{ paddingTop: '5%', paddingLeft: '5%' }}>
            Legion HQ
          </div>
          <div style={{ paddingTop: '5%', paddingLeft: '5%' }}>
            {listTournamentText.split('\n').map((line, i) => {
              if (line === '') return <br key={i} />;
              else return <div key={i}>{line}</div>;
            })}
          </div>
          <div style={{ marginLeft: '40%' }}>
            <QRCode value={listUrl} />
          </div>
        </div>
      </div>
    );
  }
}

export default ListPrintText;
