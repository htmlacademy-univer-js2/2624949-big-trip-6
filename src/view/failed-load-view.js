import AbstractView from '../framework/view/abstract-view.js';

const createFailedLoadTemplate = () => '<p class="trip-events__msg">Failed to load latest route information</p>';

export default class FailedLoadView extends AbstractView {
  get template() {
    return createFailedLoadTemplate();
  }
}
