import React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import TableRow from '@material-ui/core/TableRow';

import Kuski from 'components/Kuski';
import DerpTable from 'components/Table/DerpTable';
import DerpTableCell from 'components/Table/DerpTableCell';

import rankingQuery from './day.graphql';

class RankingMonth extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    battleType: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      rowsPerPage: 10,
    };
  }

  render() {
    const {
      battleType,
      data: { loading, getKinglistDaily },
    } = this.props;
    const { page, rowsPerPage } = this.state;
    const Points = `Points${battleType}`;
    const Ranking = `Ranking${battleType}`;
    const Wins = `Wins${battleType}`;
    const Designed = `Designed${battleType}`;
    return (
      <React.Fragment>
        {getKinglistDaily && (
          <DerpTable
            headers={[
              '#',
              'Player',
              'Ranking',
              'Points',
              'Wins',
              'Designed',
              'Day',
            ]}
            length={getKinglistDaily.length}
            pagination
            loading={loading}
            onChangePage={nextPage => this.setState({ page: nextPage })}
            onChangeRowsPerPage={rows =>
              this.setState({
                page: 0,
                rowsPerPage: rows,
              })
            }
          >
            {getKinglistDaily
              .sort((a, b) => {
                return b[Ranking] - a[Ranking];
              })
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((i, no) => {
                return (
                  <TableRow hover key={i.KinglistDailyIndex}>
                    <DerpTableCell>
                      {no + 1 + page * rowsPerPage}.
                    </DerpTableCell>
                    <DerpTableCell>
                      <Kuski kuskiData={i.KuskiData} team flag />
                    </DerpTableCell>
                    <DerpTableCell>
                      {parseFloat(i[Ranking]).toFixed(2)}
                    </DerpTableCell>
                    <DerpTableCell>{i[Points]}</DerpTableCell>
                    <DerpTableCell>{i[Wins]}</DerpTableCell>
                    <DerpTableCell>{i[Designed]}</DerpTableCell>
                    <DerpTableCell>{i.Day ? i.Day : ''}</DerpTableCell>
                  </TableRow>
                );
              })}
          </DerpTable>
        )}
      </React.Fragment>
    );
  }
}

export default compose(
  graphql(rankingQuery, {
    options: ownProps => ({
      variables: {
        Period: ownProps.period,
      },
    }),
  }),
)(RankingMonth);
