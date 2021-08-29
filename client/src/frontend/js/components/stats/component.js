import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../base-component';

let StatsComponent = new StateMachine($.extend({}, BaseComponent, {
}));

export default StatsComponent;
