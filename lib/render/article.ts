import { Request, Response } from 'express';
import { createStore } from 'redux';
import { produce } from 'immer';

import { indexHtml } from '.';
import { ssrRenderArticle } from './article-render';
import appReducers from '../../app/reducers';
import { theme } from '../../app/libs/style-helper';

export const renderArticle = (req: Request, res: Response): void => {
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
