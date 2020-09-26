import React from 'react';
import PropTypes from 'prop-types';

const thousandsValues = [1000, 59999, 60000, 3];
const hundredsValues = [100, 5999, 6000, 2];

class Time extends React.Component {
  static propTypes = {
    time: PropTypes.number.isRequired,
    apples: PropTypes.number,
    thousands: PropTypes.bool,
  };

  static defaultProps = {
    thousands: false,
    apples: 0,
  };

  formatTime = time => {
    const { apples, thousands } = this.props;
    // for cup results
    if (apples === -1) {
      if (time === 9999100) {
        return '0 apples';
      }
      if (time >= 999900 && time <= 999999) {
        return `${1000000 - time} apple${1000000 - time !== 1 ? `s` : ``}`;
      }
      if (time >= 9999000 && time <= 9999999) {
        return `${10000000 - time} apple${10000000 - time !== 1 ? `s` : ``}`;
      }
    }
    if (time === 0) {
      return `${apples} apple${apples !== 1 ? `s` : ``}`;
    }
    let values = hundredsValues;
    if (thousands) {
      values = thousandsValues;
    }
    const string = `${Math.floor((time / values[0]) % 60)
      .toString()
      .padStart(time > 999 ? 2 : 1, 0)},${(time % values[0])
      .toString()
      .padStart(values[3], 0)}`;

    if (time > values[1]) {
      return `${Math.floor(time / values[2])}:${string}`;
    }

    return string;
  };

  render() {
    const { time } = this.props;
    return <span>{this.formatTime(time)}</span>;
  }
}

export default Time;
