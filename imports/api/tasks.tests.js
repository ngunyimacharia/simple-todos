/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Tasks } from './tasks.js';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';

if (Meteor.isServer) {

  describe('Tasks', () => {
    describe('methods', () => {
      const username = 'ngunyimacharia';
      const otherUserId = Random.id();
      let taskId, userId;

      before( () => {

        userId =  Accounts.createUser({
          username: username,
          email: 'username@example.tld',
          password: 'password',
        });

      });


      beforeEach(() => {

        Tasks.remove({});
        taskId = Tasks.insert({
          text: 'test task',
          createdAt: new Date(),
          owner: userId,
          username: username,
          private: false,
          checked: false,
        });

      });

      after( ()=>{
        Meteor.users.remove({ username });
        Meteor.users.find({}).count();
      });

      it('can insert task', ()=>{
        const text = 'Hello!';
        const insertTask = Meteor.server.method_handlers['tasks.insert'];
        const fakeUserObject = { userId };
        insertTask.apply(fakeUserObject, [text]);
        assert.equal(Tasks.find().count(), 2);
      });

      it('cannot insert task if not logged in', ()=>{
        const insertTask = Meteor.server.method_handlers['tasks.insert'];
        const fakeUserObject = { };
        assert.throws(() => {
          insertTask.apply(fakeUserObject, ['New task']);
        },Meteor.Error, 'not-authorized');
      });

      it('can delete owned task', () => {
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];
        const fakeUserObject = { userId };
        deleteTask.apply(fakeUserObject, [taskId]);
        assert.equal(Tasks.find().count(), 0);
      });

      it('cannot delete someone elses task', () => {
        Tasks.update(taskId,{$set:{private:true}});
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];
        const fakeUserObject = { 'userId':otherUserId };
        assert.throws(() => {
          deleteTask.apply(fakeUserObject,[taskId]);
        },Meteor.Error, 'not-authorized');
      });

      it('can delete someone elses public task', () => {
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];
        const fakeUserObject = { 'userId':otherUserId };
        deleteTask.apply(fakeUserObject,[taskId]);
        assert.equal(Tasks.find().count(), 0);
      });

      it('can check owned task', () => {
        const checkTask = Meteor.server.method_handlers['tasks.setChecked'];
        const fakeUserObject = { userId };
        checkTask.apply(fakeUserObject, [taskId, true]);
        assert.equal(Tasks.findOne(taskId).checked, true);
      });

      it('cannot check someone elses task', () => {
        Tasks.update(taskId,{$set:{private:true}});
        const checkTask = Meteor.server.method_handlers['tasks.setChecked'];
        const fakeUserObject = { 'userId':otherUserId };
        assert.throws(() => {
          checkTask.apply(fakeUserObject, [taskId, true]);
        },Meteor.Error, 'not-authorized');
      });

      it('can set private owned task', () => {
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];
        const fakeUserObject = { userId };
        setPrivate.apply(fakeUserObject, [taskId, true]);
        assert.equal(Tasks.findOne(taskId).private, true);
      });

      it('cannot set private someone elses task', () => {
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];
        const fakeUserObject = { 'userId':otherUserId };
        assert.throws(() => {
          setPrivate.apply(fakeUserObject, [taskId, true]);
        },Meteor.Error, 'not-authorized');
      });

    });

  });

}
