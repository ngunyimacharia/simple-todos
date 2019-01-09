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
      const userId = Random.id();
      let taskId;

      before( () => {
        // It's here we create a new user if needed
      });

      beforeEach(() => {

        Tasks.remove({});
        taskId = Tasks.insert({
          text: 'test task',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
        });

      });

      it('can delete owned task', () => {
        // Find the internal implementation of the task method so we can
        // test it in isolation
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];
        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };
        // Run the method with `this` set to the fake invocation
        deleteTask.apply(invocation, [taskId]);
        // Verify that the method does what we expected
        assert.equal(Tasks.find().count(), 0);
      });

      it('can check owned task', () => {
        // Find the internal implementation of the task method so we can
        // test it in isolation
        const checkTask = Meteor.server.method_handlers['tasks.setChecked'];
        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };
        // Run the method with `this` set to the fake invocation
        checkTask.apply(invocation, [taskId, true]);
        // Verify that the method does what we expected
        assert.equal(Tasks.findOne(taskId).checked, true);
      });

      it('can set private owned task', () => {
        // Find the internal implementation of the task method so we can
        // test it in isolation
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];
        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };
        // Run the method with `this` set to the fake invocation
        setPrivate.apply(invocation, [taskId, true]);
        // Verify that the method does what we expected
        assert.equal(Tasks.findOne(taskId).private, true);
      });

    });
  });

}
