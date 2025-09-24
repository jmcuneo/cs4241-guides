# Vite
There are [lots of ways to start a React project](https://reactjs.org/docs/add-react-to-a-website.html). You can create a basic React project (using Babel to compile and Snowpack to bundle) by following [these instructions at createapp.dev](https://createapp.dev/snowpack). You can also use createapp.dev to generate Svelte apps, and add in additional features and libraries like Bootstrap, Typescript etc. 

However, we're going to use Vite in class. Vite is a relatively new tooling system for frontend development, just being introduced in the past couple of years, but it's already [experiencing widespread use](https://2024.stateofjs.com/en-US/libraries/build_tools/). It tends to be faster than Webpack (another very popular front-end system), and configuration, when needed, also tends to be easier. It will handle transpiling our React code into HTML and most of the static routes, so we can solely focus on routes for manipulating our data on the server.

You can follow the [instructions for setting up Vite + Express](https://github.com/szymmis/vite-express) to create your project and get it running. When prompted, select `React` for your framework and `JavaScript + SWC` for your variant. If asked about `rolldown-vite`, answer "No". Finally, let npm automatically install and run the program, or else run the following commands:

```
cd <project-name>
npm install
npm run dev
```

You should then see something like the following:

```
  VITE v7.1.7  ready in 280 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Congratulations! You've just created your first React project with Vite! Go to the specified localhost URL in your browser to see it.

# Server
The demo server for this example code has three routes to read, add, and update todos that are stored in memory. Place this file in the top-level of your React project. Make sure to install both `express` and `vite-express` first!

```js
import express from  'express'
import ViteExpress from 'vite-express'

const app = express()

const todos = [
  { name:'buy groceries', completed:false }
]

app.use( express.json() )

app.get( '/read', ( req, res ) => res.json( todos ) )

app.post( '/add', ( req,res ) => {
  todos.push( req.body )
  res.json( todos )
})

app.post( '/change', function( req,res ) {
  const idx = todos.findIndex( v => v.name === req.body.name )
  todos[ idx ].completed = req.body.completed
  
  res.sendStatus( 200 )
})

ViteExpress.listen( app, 3000 )
```

Start your server with `node server.js`. You should now have a fully-fledged web application with React, Vite, and Express running at localhost:3000.

## React
First, we require a basic file that loads our `App` component into a particular DOM element. Below is the `main.jsx` file that Vite created for us in the `src` folder; you shouldn't need to modify this file. Note that `.jsx` is a hybrid of JS / HTML and templating markup that *WILL NOT* run in the browser unless we compile it first. Vite will take care of that for us.

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

In the example above, we've imported the `App` *component*, which we can then instantiate. A component is an entity that (typically) has data (HTML), behavior (JavaScript), and styling (CSS) associated with it. In React, the data and behavior for components go in a single file while CSS can be imported for styling. 

You'll note that `create-vite` has already given you a `App.jsx` file. If you look inside, you might be able to get a sense of what is happening. The App component is reading in any attributes we pass when we instantiate it in `main.jsx` and then assigning the values to `props`. Then we can use React templating notation to easily interpolate those values as needed. Try adding another attribute to the App element in `main.jsx`, and then see if you can get it displayed by changing `App.jsx`.

## Making a TODO list application

Next let's edit our `App.jsx` file to work with our todo list express server. Again, this file is converted into valid JS by Vite, but React enables us to author our components by freely mixing HTML and JS. Delete everything in the `App.jsx` file and replace it with the code below:

```jsx
import React from 'react';

// we could place this Todo component in a separate file, but it's
// small enough to alternatively just include it in our App.js file.

class Todo extends React.Component {
  // our .render() method creates a block of HTML using the .jsx format
  render() {
    return <li>{this.props.name} : 
      <input type="checkbox" defaultChecked={this.props.completed} onChange={ e => this.change(e) }/>
    </li>
  }
  // call this method when the checkbox for this component is clicked
  change(e) {
    this.props.onclick( this.props.name, e.target.checked )
  }
}

// main component
class App extends React.Component {
  constructor( props ) {
    super( props )
    // initialize our state
    this.state = { todos:[] }
    this.load()
  }

  // load in our data from the server
  load() {
    fetch( '/read', { method:'get', 'no-cors':true })
      .then( response => response.json() )
      .then( json => {
         this.setState({ todos:json }) 
      })
  }

  // render component HTML using JSX 
  render() {
    return (
      <div className="App">
      <input type='text' /><button onClick={ e => this.add( e )}>add</button>
        <ul>
          { this.state.todos.map( (todo,i) => <Todo key={i} name={todo.name} completed={todo.completed} onclick={ this.toggle } /> ) }
       </ul> 
      </div>
    )
  }
}

export default App;
```

There's a lot of boilerplate to get started, but here we're creating two different components. The first is an item to represent a single Todo, while the second is our higher-level application. Note that we pass data from our app component to each todo via the `props` object, which lets us pass data through HTML attributes. So, in our example above, each `Todo` is created with a `name` attribute, and that attribute is subsequently available in the `props` object of the associated `Todo`. You can see we also assign/access the `.completed` and `.onclick` property of each `Todo` in the same way.

We also have introduced the `.state` property. In React, this is immutable, meaning you can't change values found inside of `.state`; you can only reset the state in its entirety. We do this using the `.setState` method of the `React.Component` superclass, and these changes in state are what effectivey trigger reactive changes in our UI.

Last but not least, we add functions or updating our exising todos and adding new todos.

```js
  // when an Todo is toggled, send data to server
  toggle( name, completed ) {
    fetch( '/change', {
      method:'POST',
      body: JSON.stringify({ name, completed }),
      headers: { 'Content-Type': 'application/json' }
    })
  }
 
  // add a new todo list item
  add( evt ) {
    const value = document.querySelector('input').value

    fetch( '/add', { 
      method:'POST',
      body: JSON.stringify({ name:value, completed:false }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then( response => response.json() )
    .then( json => {
       // changing state triggers reactive behaviors
       this.setState({ todos:json }) 
    })
  }
```

## Using function components
Instead of using classes (which was originally the only option in React for creating components), we can use functions. This allows us to define small components as 3--5 line arrow functions, instead of needing all the class syntax.

```jsx
import React, { useState, useEffect } from 'react'

const Todo = props => (
  <li>{props.name} : 
    <input type="checkbox" defaultChecked={props.completed} onChange={ e => props.onclick( props.name, e.target.checked ) }/>
  </li>
)

const App = () => {
  const [todos, setTodos] = useState([ ]) 

  function toggle( name, completed ) {
    fetch( '/change', {
      method:'POST',
      body: JSON.stringify({ name, completed }),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  function add() {
    const value = document.querySelector('input').value

    fetch( '/add', {
      method:'POST',
      body: JSON.stringify({ name:value, completed:false }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then( response => response.json() )
    .then( json => {
       setTodos( json )
    })
  }
  
  // make sure to only do this once
  if( todos.length === 0 ) {
    fetch( '/read' )
      .then( response => response.json() )
      .then( json => {
        setTodos( json ) 
      })
  }
    
  useEffect( ()=> {
    document.title = `${todos.length} todo(s)`
  })

  return (
    <div className="App">
    <input type='text' /><button onClick={ e => add()}>add</button>
      <ul>
        { todos.map( (todo,i) => <Todo key={i} name={todo.name} completed={todo.completed} onclick={ toggle } /> ) }
     </ul> 
    </div>
  )
}

export default App
```

We can also call `useEffect()` to only run a block of code once:

```jsx
 useEffect(()=> {
    fetch( '/read' )
      .then( response => response.json() )
      .then( json => {
        setTodos( json ) 
      })
  }, [] )
```
