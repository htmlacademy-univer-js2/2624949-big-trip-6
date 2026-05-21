import {render} from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortView, { SortType } from '../view/sort-view.js';
import ListView from '../view/list-view.js';
import ListEmptyView from '../view/list-empty-view.js';
import PointPresenter from './point-presenter.js';

const DEFAULT_SORT_TYPE = SortType.DAY;

function sortPointsByDay(pointA, pointB) {
  return new Date(pointA.dateFrom) - new Date(pointB.dateFrom);
}

function sortPointsByTime(pointA, pointB) {
  const durationA = new Date(pointA.dateTo) - new Date(pointA.dateFrom);
  const durationB = new Date(pointB.dateTo) - new Date(pointB.dateFrom);
  return durationB - durationA;
}

function sortPointsByPrice(pointA, pointB) {
  return pointB.basePrice - pointA.basePrice;
}

const SortFunctionMap = {
  [SortType.DAY]: sortPointsByDay,
  [SortType.TIME]: sortPointsByTime,
  [SortType.PRICE]: sortPointsByPrice,
};

export default class TripPresenter {
  #tripEventsContainer = null;
  #pointsModel = null;
  #filterModel = null;

  #listComponent = new ListView();
  #sortComponent = null;
  #listEmptyComponent = new ListEmptyView();
  #pointPresenters = new Map();
  #currentSortType = DEFAULT_SORT_TYPE;

  #destinations = null;
  #destinationsById = null;
  #offers = null;
  #offersById = null;

  constructor({ tripEventsContainer, pointsModel, filterModel, onNewPointDestroy }) {
    this.#tripEventsContainer = tripEventsContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#headerContainer = document.querySelector('.trip-main');

    this.#newPointPresenter = new NewPointPresenter({
      listContainer: this.#listComponent.element,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewPointDestroy
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[filterType](points);

    switch (this.#currentSortType) {
      case SortType.DAY:
        return filteredPoints.sort(sortPointDay);
      case SortType.TIME:
        return filteredPoints.sort(sortPointTime);
      case SortType.PRICE:
        return filteredPoints.sort(sortPointPrice);
    }

    return filteredPoints;
  }

  get destinations() {
    return this.#pointsModel.destinations;
  }

  get offers() {
    return this.#pointsModel.offers;
  }

  init() {
    const points = this.#pointsModel.points;
    this.#destinations = this.#pointsModel.destinations;
    this.#offers = this.#pointsModel.offers;
    this.#destinationsById = new Map(
      this.#destinations.map((destination) => [destination.id, destination]),
    );
    this.#offersById = new Map(this.#offers.map((offer) => [offer.id, offer]));

    const filtersComponent = new FiltersView();

    render(filtersComponent, this.#filtersContainer);

    if (points.length === 0) {
      render(new ListEmptyView(), this.#tripEventsContainer);
      return;
    }

    this.#sortComponent = new SortView({
      onSortTypeChange: this.#handleSortTypeChange,
    });

    render(this.#sortComponent, this.#tripEventsContainer);
    render(this.#listComponent, this.#tripEventsContainer);

    this.#renderPoints(points);
  }

  #renderPoints(points) {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    const sortedPoints = [...points].sort(SortFunctionMap[this.#currentSortType]);

    for (const point of sortedPoints) {
      const pointPresenter = new PointPresenter({
        point,
        destinations: this.#destinations,
        destinationsById: this.#destinationsById,
        offers: this.#offers,
        offersById: this.#offersById,
        listContainer: this.#listComponent.element,
        onDataChange: this.#handlePointChange,
        onModeChange: this.#handlePointModeChange,
      });

      this.#pointPresenters.set(point.id, pointPresenter);
      pointPresenter.init();
    }
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#renderPoints(this.#pointsModel.points);
  };

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
