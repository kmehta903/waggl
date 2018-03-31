import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { startCase } from 'lodash';
import { Card, Divider, Icon, message, Tooltip } from 'antd';

import { addFavorite, removeFavorite } from '../actions/searchActions';

class DogCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seeProfile: false,
    };
    this.toggleFavorite = this.toggleFavorite.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({ seeProfile: true });
  }

  async toggleFavorite() {
    const { id } = this.props.dog;
    const { favorites } = this.props;
    const { favoriteParams } = this.props;

    const newFavoriteParams = {
      ...favoriteParams,
      dogId: id,
    };

    if (favorites[id]) {
      await this.props.removeFavorite(newFavoriteParams);
    } else {
      await this.props.addFavorite(newFavoriteParams);
    }

    message.info(!favorites[id] ? 'Added to favorites!' : 'Removed from favorites');
  }

  render() {
    const { dog } = this.props;
    const { favorites } = this.props;
    const { id } = this.props.dog;

    const url = `/dog/${dog.id}`;
    if (this.state.seeProfile) {
      return <Redirect to={url} />;
    }

    const stage = startCase(dog.lifestage);

    const adoptedStyle = { color: '#00db19', fontWeight: 700, marginTop: 5 };
    const notAdoptedStyle = { color: '#db0000', fontWeight: 700, marginTop: 5 };

    return (
      <Card
        hoverable
        style={{ width: 300, margin: 30 }}
        cover={<img alt="pupper" onClick={this.onClick} src={dog.photo} style={{ height: 300, width: 300, objectFit: 'cover' }} />}
        actions={
          this.props.user && this.props.user.org_id === 1 ?
          [(favorites[id] ?
            <Tooltip title="Unfavorite"><Icon type="heart" onClick={this.toggleFavorite} /></Tooltip> :
            <Tooltip title="Favorite"><Icon type="heart-o" onClick={this.toggleFavorite} /></Tooltip>)] : null
        }
      >
        <Card.Meta title={dog.name} onClick={this.onClick} />
        <div style={{ marginTop: 10 }} >
          <span> {dog.breed} {dog.mix ? 'Mix' : ''} </span>
          <br />
          <span> {dog.male ? 'Male' : 'Female'} </span>
          <Divider type="vertical" />
          <span> {stage} </span>
        </div>
        <div style={dog.adopted ? adoptedStyle : notAdoptedStyle}> {dog.adopted ? 'Adopted' : 'Looking for a Home' } </div>
      </Card>
    );
  }
}

const mapStateToProps = ({ search, storeUser }) => (
  {
    results: search.results,
    favorites: search.favorites.favoriteDogs,
    user: storeUser.user,
    favoriteParams: {
      adopterId: !storeUser.user ? 1 : storeUser.user.adopterId,
    },
  }
);

const mapDispatchToProps = {
  addFavorite,
  removeFavorite,
};

export default connect(mapStateToProps, mapDispatchToProps)(DogCard);

// TODO: make photo in card view square
