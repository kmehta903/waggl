import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Form, Icon, Input, Button, Modal, message } from 'antd';
import axios from 'axios';

import { toggleLoginModal, storeUserId } from '../actions/loginActions';

const FormItem = Form.Item;

const WrappedLoginForm = Form.create()(class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      forgotPassword: false,
      loading: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleModal = this.props.toggleLoginModal.bind(this);
    this.storeUser = this.props.storeUserId.bind(this);
    this.handleForgotPasswordOrGoBack = this.handleForgotPasswordOrGoBack.bind(this);
    this.changeForgotPasswordToFalse = this.changeForgotPasswordToFalse.bind(this);
  }

  handleForgotPasswordOrGoBack() {
    this.setState({
      forgotPassword: !this.state.forgotPassword,
      email: [],
    });
  }

  handleSubmitForgotPassword(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios.put('/forgotpass', {
          email: values.emailReset,
        })
          .then((res) => {
            if (res.data.message !== 'This Email Does Not Exists') {
              message.success('A pack of search dogs have sent you an email!', 5);
            } else {
              message.error('Uh oh, we do not recognize this email address.', 5);
            }
          })
          .catch((error) => {
            message.error(`Uh oh, something went wrong: ${error}`, 10);
          });
      }
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        axios.post('/login', values)
          .then((response) => {
            this.toggleModal();
            this.storeUser({ user: response.data.user });
            this.props.form.resetFields();
            this.setState({ loading: false });
            this.props.history.push('/profile');
          })
          .catch((error) => {
            this.setState({ loading: false });
            const info = error.response.data;
            if (info === 'user not found') {
              message.error('Sorry, this username could not be found.', 5);
            } else if (info === 'incorrect password') {
              message.error('Sorry, the password was incorrect.', 5);
            } else if (info === 'unknown error') {
              message.error('Sorry, an unknown error occurred.', 5);
            }
          });
      }
    });
  }

  changeForgotPasswordToFalse() {
    setTimeout(() => {
      this.setState({
        forgotPassword: false,
      });
    }, 500);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        id="login"
        title={this.state.forgotPassword ? 'Reset Password' : 'Please Log In'}
        visible={this.props.visible}
        onCancel={() => { this.toggleModal(); this.changeForgotPasswordToFalse(); }}
        footer={this.state.forgotPassword ?
          [
            <Button key="goBack" className="forgot" onClick={this.handleForgotPasswordOrGoBack}>Go Back</Button>,
            <Button key="cancel" onClick={() => { this.toggleModal(); this.changeForgotPasswordToFalse(); }}>Cancel</Button>,
            <Button key="submit" onClick={e => this.handleSubmitForgotPassword(e)}>Submit</Button>,
          ]
          :
          [
            <Button key="reset" className="forgot" onClick={this.handleForgotPasswordOrGoBack}>Reset Password</Button>,
            <Button key="back" onClick={() => { this.toggleModal(); }}>Cancel</Button>,
            <Button id="login" key="login" type="primary" onClick={this.handleSubmit} loading={this.state.loading}>Log In</Button>,
          ]
        }
      >
        {this.state.forgotPassword ?
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem>
              {getFieldDecorator('emailReset', {
                rules: [
                  { type: 'email', message: 'Please input a valid email address!' },
                  { required: true, message: 'Please input a email address!' },
                ],
              })(<Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Email"
                onKeyUp={(e) => { if (e.key === 'Enter') this.handleSubmitForgotPassword(e); }}
              />)}
            </FormItem>
          </Form>
          :
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem>
              {getFieldDecorator('username', {
                rules: [{ required: true, message: 'Please input your username!' }],
              })(<Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Username"
                onKeyUp={(e) => { if (e.key === 'Enter') this.handleSubmit(e); }}
              />)}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input your Password!' }],
              })(<Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                onKeyUp={(e) => { if (e.key === 'Enter') this.handleSubmit(e); }}
                type="password"
                placeholder="Password"
              />)}
            </FormItem>
          </Form>
        }
      </Modal>
    );
  }
});

const mapStateToProps = state => (
  {
    visible: state.loginModal.visible,
    user: state.storeUser.user,
  }
);

export default withRouter(connect(mapStateToProps, { toggleLoginModal, storeUserId })(WrappedLoginForm)); // eslint-disable-line
