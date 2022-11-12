import 'antd/dist/antd.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import IndexLayout from './pages/Layout'
import Main from './pages/Main'
import Now from './pages/Now'

const router = createBrowserRouter([
  {
    path: '/*',
    element: <IndexLayout />,
    children: [
      {
        path: '',
        element: <Main />,
      },
      {
        path: 'now',
        element: <Now />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    {/* <App /> */}
  </React.StrictMode>
)
