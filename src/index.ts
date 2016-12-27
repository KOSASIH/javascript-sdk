import * as Promise from 'bluebird';
import * as assign from 'lodash/assign';
import * as omit from 'lodash/omit';

import { requestApi } from './modules/requestApi';
import { requestResults } from './modules/requestResults';

import {
  Config,
  RecommendationsType,
  AutocompleteRequest,
  SearchRequest,
  CollectionRequest,
  RecommendationsRequest,
  PredefinedRecommendationsRequest,
  ViewedRecommendationsRequest,
  BoughtRecommendationsRequest,
  FeedbackRequest,
  AutocompleteResponse,
  SearchResponse,
  CollectionResponse,
  RecommendationsResponse,
} from './types';

function init(config: Config) {
  if (!config || typeof config.key === 'undefined') {
    throw new Error('"key" param is required');
  }

  return {
    autocomplete(request: AutocompleteRequest) {
      if (!request || typeof request.q === 'undefined') {
        throw new Error('"q" param is required');
      }

      return requestApi('/autocomplete', request, config);
    },

    search(request: SearchRequest) {
      if (!request || typeof request.q === 'undefined') {
        throw new Error('"q" param is required');
      }

      return requestResults('/search', request, config);
    },

    collection(request: CollectionRequest) {
      if (!request || typeof request.slot === 'undefined') {
        throw new Error('"slot" param is required');
      }

      const omittedRequest = omit(request, ['slot']);

      return requestResults(`/collection/${request.slot}`, omittedRequest, config);
    },

    recommendations(type: RecommendationsType, request?: RecommendationsRequest) {
      type ViewedOrBought = ViewedRecommendationsRequest | BoughtRecommendationsRequest;

      const slot = request ? (request as PredefinedRecommendationsRequest).slot : undefined;
      const itemId = request ? (request as ViewedOrBought).item_id : undefined;

      if (type === 'predefined' && (!request || typeof slot === 'undefined')) {
        throw new Error('"slot" param is required');
      }

      if ((type === 'viewed' || type === 'bought') && (!request || typeof itemId === 'undefined')) {
        throw new Error('"item_id" param is required');
      }

      if (type === 'predefined') {
        const omittedRequest = omit(request, ['slot']);
        return requestApi(`/recommend/${slot}`, omittedRequest, config);
      }

      if (type === 'viewed') {
        const omittedRequest = omit(request, ['item_id']);
        return requestApi(`/recommend/items/${itemId}/viewed/viewed`, omittedRequest, config);
      }

      if (type === 'bought') {
        const omittedRequest = omit(request, ['item_id']);
        return requestApi(`/recommend/items/${itemId}/viewed/bought`, omittedRequest, config);
      }

      if (type === 'featured') {
        return requestApi('/recommend/items/featured', {}, config);
      }

      if (type === 'newest') {
        return requestApi('/recommend/items/newest', request, config);
      }

      if (type === 'trending') {
        return requestApi('/recommend/items/trending', request, config);
      }

      if (type === 'latest') {
        return requestApi('/recommend/items/latest', request, config);
      }
    },

    feedback(request: FeedbackRequest) {
      if (!request || typeof request.event === 'undefined') {
        throw new Error('"event" param is required');
      }

      return requestApi('/feedback', request, config);
    },
  };
}

type Client = {
  autocomplete(request: AutocompleteRequest): Promise<AutocompleteResponse>,
  search(request: SearchRequest): Promise<SearchResponse>,
  collection(request: CollectionRequest): Promise<CollectionResponse>,
  recommendations(type: RecommendationsType, request?: RecommendationsRequest): Promise<RecommendationsResponse>,
  feedback(request: FeedbackRequest): Promise<void>,
}

export {
  init,
};
