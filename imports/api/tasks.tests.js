/* eslint-env mocha */

/*
Add for
1. Set checked of same user.
2. Set private of same user.
3.
*/
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Tasks } from './tasks.js';
import { assert } from 'chai';

if (Meteor.isServer) {

  describe('Tasks', () => {
    describe('methods', () => {
      const username = 'ngunyimacharia';
      const otherUserId = Random.id();
      let taskId;
      let userId;
      before( () => {

        if( Meteor.users.find({ username }).count() < 1){
          Accounts.createUser({
            username: username,
            password: 'password',
          });
        }
        userId = Meteor.users.findOne({ username })._id;

      });


      beforeEach(() => {

        Tasks.remove({});
        taskId = Tasks.insert({
          text: 'test task',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
          private: true,
          checked: false,
        });

      });

      it('can insert task', ()=>{
        const insertTask = Meteor.server.method_handlers['tasks.insert'];
        const invocation = { userId };
        insertTask.apply(invocation, ['New task']);
        assert.equal(Tasks.find().count(), 2);
      });

      it('cannot insert task if not logged in', ()=>{
        const insertTask = Meteor.server.method_handlers['tasks.insert'];
        const invocation = { };
        try{
          insertTask.apply(invocation, ['New task']);
        }catch(err){
          assert.equal(err.error, 'not-authorized');
        }finally{
          assert.equal(Tasks.find().count(), 1);
        }
      });

      it('can delete owned task', () => {
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];
        const invocation = { userId };
        deleteTask.apply(invocation, [taskId]);
        assert.equal(Tasks.find().count(), 0);
      });

      it('cannot delete someone elses task', () => {
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];
        const invocation = { 'userId':otherUserId };
        assert.throws(function(){
          deleteTask.apply(invocation,[taskId]);
        },Meteor.Error, 'not-authorized');
        // try{
        //   deleteTask.apply(invocation, [taskId]);
        // }catch(err){
        //   assert.equal(err.error, 'not-authorized');
        // }finally{
        //   assert.equal(Tasks.find().count(), 1);
        // }
      });

      it('can check owned task', () => {
        const checkTask = Meteor.server.method_handlers['tasks.setChecked'];
        const invocation = { userId };
        checkTask.apply(invocation, [taskId, true]);
        assert.equal(Tasks.findOne(taskId).checked, true);
      });

      it('cannot check someone elses task', () => {
        const checkTask = Meteor.server.method_handlers['tasks.setChecked'];
        const invocation = { 'userId':otherUserId };
        try{
          checkTask.apply(invocation, [taskId, true]);
        }catch(err){
          assert.equal(err.error, 'not-authorized');
        }finally{
          assert.equal(Tasks.findOne(taskId).checked, false);
        }
      });

      it('can set private owned task', () => {
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];
        const invocation = { userId };
        setPrivate.apply(invocation, [taskId, true]);
        assert.equal(Tasks.findOne(taskId).private, true);
      });

      it('cannot set private someone elses task', () => {
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];
        const invocation = { 'userId':otherUserId };
        try{
          setPrivate.apply(invocation, [taskId, true]);
        }catch(err){
          assert.equal(err.error, 'not-authorized');
        }finally{
          assert.equal(Tasks.find().count(), 1);
        }
      });

    });
  });

}
