import { Request, Response } from 'express';
import { createStore } from 'redux';
import { produce } from 'immer';

import cyan from '@material-ui/core/colors/cyan';
import deepOrange from '@material-ui/core/colors/deepOrange';
import { createMuiTheme } from '@material-ui/core/styles';

import { indexHtml } from '.';
import { ssrRenderArticle } from './article-render';
import appReducers from '../../app/reducers';

export const renderArticle = (req: Request, res: Response): void => {
  const theme = createMuiTheme({
    palette: {
      primary: cyan,
      secondary: deepOrange,
    },
  });

  const store = createStore(appReducers, produce({}, () => ({})));

  // Render the component to a string
  const html = ssrRenderArticle({
    theme,
    store,
  });

  const data = {
    html,
    // initialState,
    req,
    title: 'A Fruit Tree Emergency',
  };
  res.send(indexHtml(data, false));
};
