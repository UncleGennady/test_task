'use strict';

import Controller from "./mvc/controller.js";
import View from './mvc/view.js';
import Model from './mvc/model.js';


const app = new Controller(Model, View);
app.init();
console.log(app)

