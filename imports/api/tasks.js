import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if(Meteor.isServer){
  //This code runs on the server only
  Meteor.publish('tasks',function tasksPublication(){
      return Tasks.find();
  });
}

Meteor.methods({

  'tasks.insert'(text){
    check(text,String);

    //make sure user is logged in before inserting a task
    if(! Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }

    Tasks.insert({
      text,
      createdAt: new Date(), // current time
      owner: Meteor.userId(),
      username: Meteor.user().username,
    });
  },

  'tasks.remove'(taskId){
    check(taskId,String);

    var task = Tasks.findOne(taskId);
    if(task.private && task.owner !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }

    Tasks.remove(taskId);
  },

  'tasks.setChecked'(taskId,setChecked){
    check(taskId,String);
    check(setChecked,Boolean);

    var task = Tasks.findOne(taskId);
    if(task.private && task.owner !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }


    Tasks.update(
      taskId,
      {
        $set:{ checked: setChecked }
      }
    );
  },

  'tasks.setPrivate'(taskId,setToPrivate){
    check(taskId,String);
    check(setToPrivate,Boolean);

    const task = Tasks.findOne(taskId);

    //Make sure task owner can make a task Private
    if(task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, {$set: {private: setToPrivate}});
  }
})
