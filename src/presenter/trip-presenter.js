import {render} from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import ListView from '../view/list-view.js';
import ListEmptyView from '../view/list-empty-view.js';
import { generateFilter } from '../mock/filter.js';
import PointPresenter from './point-presenter.js';

export default class TripPresenter {
  #filtersContainer = null;
  #tripEventsContainer = null;
  #pointsModel = null;

  #listComponent = new ListView();
  #sortComponent = new SortView();
  #listEmptyComponent = new ListEmptyView();
  #pointPresenters = new Map();

  constructor({ filtersContainer, tripEventsContainer, pointsModel }) {
    this.#filtersContainer = filtersContainer;
    this.#tripEventsContainer = tripEventsContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    const points = this.#pointsModel.points;
    const destinations = this.#pointsModel.destinations;
    const offers = this.#pointsModel.offers;
    const destinationsById = new Map(
      destinations.map((destination) => [destination.id, destination]),
    );
    const offersById = new Map(offers.map((offer) => [offer.id, offer]));

    const filters = generateFilter(points);
    const filtersComponent = new FiltersView({ filters });

    render(filtersComponent, this.#filtersContainer);

    if (points.length === 0) {
      render(this.#listEmptyComponent, this.#tripEventsContainer);
      return;
    }

    render(this.#sortComponent, this.#tripEventsContainer);
    render(this.#listComponent, this.#tripEventsContainer);

    for (const point of points) {
      const pointPresenter = new PointPresenter({
        point,
        destinations,
        destinationsById,
        offers,
        offersById,
        listContainer: this.#listComponent.element,
        onDataChange: this.#handlePointChange,
        onModeChange: this.#handlePointModeChange,
      });

      this.#pointPresenters.set(point.id, pointPresenter);
      pointPresenter.init();
    }
  }

  #handlePointChange = (updatedPoint) => {
    const pointIndex = this.#pointsModel.points.findIndex((point) => point.id === updatedPoint.id);

    if (pointIndex === -1) {
      return;
    }

    this.#pointsModel.points[pointIndex] = updatedPoint;
    this.#pointPresenters.get(updatedPoint.id)?.updatePoint(updatedPoint);
  };

  #handlePointModeChange = (activePointPresenter) => {
    this.#pointPresenters.forEach((pointPresenter) => {
      if (pointPresenter !== activePointPresenter) {
        pointPresenter.resetView();
      }
    });
  };
}
