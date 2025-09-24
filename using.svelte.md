# Vite
We're going to use Vite in class to spin up a Svelte projct. Vite is a relatively new tooling system for frontend development, just being introduced in the past couple of years, but it's already [experiencing widespread use](https://2024.stateofjs.com/en-US/libraries/build_tools/). It tends to be faster than Webpack (another very popular front-end system), and configuration, when needed, also tends to be easier. It will handle transpiling our Svelte code into HTML and most of the static routes, so we can solely focus on routes for manipulating our data on the server.

You can follow the [instructions for setting up Vite + Express](https://github.com/szymmis/vite-express) to create your project and get it running. When prompted, select `Svelte` for your framework and `JavaScript` for your variant. If asked about `rolldown-vite`, answer "No". Finally, let npm automatically install and run the program, or else run the following commands:

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

Congratulations! You've just created your first Svelte project with Vite! Go to the specified localhost URL in your browser to see it.


# Server
The demo server for this example code has three routes to read, add, and update todos that are stored in memory. Place this file in the top-level of your Svelte project. Make sure to install both `express` and `vite-express` first!

```js
import express from  'express'
import ViteExpress from 'vite-express'

const app = express()

const todos = [
  { name:'buy groceries', completed:false }
]

app.use( express.json() )

app.use( (req,res, next) => {
  console.log( req.url )
  next()
})

// this will most likely be 'build' or 'public'
//app.use( express.static( 'dist' ) )

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

# Svelte
For a more in-depth Svelte tutorial, check out <http://svelte.dev>. This site walks you through the process of using code generation to create a small, optimized application.

## edit our App.svelte file

First, we require a basic file that loads our `App` component into a particular DOM element. Below is the `main.js` file that Vite created for us in the `src` folder; you shouldn't need to modify this file.

```js
import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
```

You'll note that `create-vite` has already given you an `App.svelte` file. This file contains the HTML that will be inserted into the main Javascript page at runtime.

Try replacing the code in `App.svelte` with the HTML below:

```html
<script>
  const getTodos = function() {
    const p = fetch( '/read', {
      method:'GET' 
    })
    .then( response => response.json() )
    .then( json => {
      console.log(json)
      return json 
    })
 
    return p
  }
  
  let promise = getTodos()
</script>
  
{#await promise then todos}
  <ul>

  {#each todos as todo}
    <li>{todo.name} : <input type='checkbox' todo={todo.name} checked={todo.completed}></li>
  {/each}

  </ul>
{/await}  
```

The part inside the `<script>` tag should look fairly normal. Outside, it's pretty weird-looking,though. The first line `{#await promise then todos}` basically says, "Every time the promise resolves, (re)create this list." Then, we start an unordered list `<ul>`. Next we're saying, "for each todo in our todos variable, create a list item." We can see that we can insert JavaScript expressions inside of the `{}` characters, similar to how in ES6, we can put them expressions between `${ }` inside of template strings.
  
If you look at the `package.json` file included in the template, you'll see there's a `build` script. Use `npm run build` to compile the Svelte application (make sure you run `npm i` before compiling for the first time). In addition to the `express` and `vite-express` packages from earlier, you also need to install the `body-parser` package. Then start the server using `node server.js`.
  
## adding new todos (reactive programming)
Now replace the code from above with the block below. Here's where the magic happens:

```html
<script>
  const getTodos = function() {
    const p = fetch( '/read', {
      method:'GET' 
    })
    .then( response => response.json() )
    .then( json => {
      console.log(json)
      return json 
    })
 
    return p
  }

  const addTodo = function( e ) {
    const todo = document.querySelector('input').value
    promise = fetch( '/add', {
      method:'POST',
      body: JSON.stringify({ name:todo, completed:false }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then( response => response.json() )
  }
  
  let promise = getTodos()
  </script>


<input type='text' />
<button on:click={addTodo}>add todo</button>

{#await promise then todos}
  <ul>

  {#each todos as todo}
    <li>{todo.name} : <input type='checkbox' todo={todo.name} checked={todo.completed} on:click={toggle}></li>
  {/each}

  </ul>
{/await}
```

In the above code, we're adding the `addTodo` function and a button that triggers it. The magic is that, simply by redefining our `promise`, our list is recreated everytime we add a new todo. The UI is *reactive* to changes in the underlying data. We're also adding a checkbox to toggle whether each todo item has been completed.

Let's add one more feature:

```html
<script>
  const getTodos = function() {
    const p = fetch( '/read', {
      method:'GET' 
    })
    .then( response => response.json() )
    .then( json => {
      console.log(json)
      return json 
    })
 
    return p
  }

  const addTodo = function( e ) {
    const todo = document.querySelector('input').value
    promise = fetch( '/add', {
      method:'POST',
      body: JSON.stringify({ name:todo, completed:false }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then( response => response.json() )
  }

  const toggle = function( e ) {
    fetch( '/change', {
      method:'POST',
      body: JSON.stringify({ name:e.target.getAttribute('todo'), completed:e.target.checked }),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let promise = getTodos()
</script>

<input type='text' />
<button on:click={addTodo}>add todo</button>

{#await promise then todos}
  <ul>

  {#each todos as todo}
    <li>{todo.name} : <input type='checkbox' todo={todo.name} checked={todo.completed} on:click={toggle}></li>
  {/each}

  </ul>
{/await}
```

Here we're simply submitting a POST to request whenever each checkbox is checked/unchecked to update the data on the server. The UI is automatically changed via normal HTML behavior; however, the UI will also reflect changes to the data when the page is refreshed.
