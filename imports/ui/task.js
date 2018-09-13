import { Template } from 'meteor/templating';
import { Tasks } from '../api/tasks.js';
import './task.html';

Template.task.helpers({
  isOwner(){
    return this.owner === Meteor.userId();
  }
});

Template.task.events({

  'click .toggle-checked'() {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked',this._id, !this.checked);
  },

  'click .delete'() {
    var myId = this._id;
    if(typeof myId == 'object'){
      myId = this._id._str;
    }
    Meteor.call('tasks.remove',myId);
  },

  'click .toggle-private'(){
    var myId = this._id;
    if(typeof myId == 'object'){
      myId = this._id._str;
    }
    Meteor.call('tasks.setPrivate', myId, !this.private);
  }
});
