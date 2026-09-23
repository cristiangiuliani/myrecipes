import type { RouteObject } from 'react-router-dom'
import { RecipeDetailPage, RecipeListPage } from '@/features/recipes'
import { AppLayout } from './layout/AppLayout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <RecipeListPage /> },
      { path: 'recipes/:id', element: <RecipeDetailPage /> },
    ],
  },
]
