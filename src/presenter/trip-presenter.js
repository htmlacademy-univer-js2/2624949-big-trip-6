import { render, RenderPosition } from "../render";
import FiltersView from "../view/filters-view";
import SortView from "../view/sort-view";
import ListView from "../view/list-view";
import PointView from "../view/point-view";
import EditPointView from "../view/edit-point-view";

export default class TripPresenter {
  #filtersContainer = null;
  #tripEventsContainer = null;
  #pointsModel = null;

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

    const filtersComponent = new FiltersView();
    const sortComponent = new SortView();
    const listComponent = new ListView();

    render(filtersComponent, this.#filtersContainer);
    render(sortComponent, this.#tripEventsContainer);
    render(listComponent, this.#tripEventsContainer);

    const pointListContainer = listComponent.getElement();
    const firstPoint = points[0] ?? null;

    const editPointComponent = new EditPointView({
      point: firstPoint,
      destinations,
      destinationsById,
      offers,
    });

    const createPointComponent = new EditPointView({
      destinations,
      destinationsById,
      offers,
    });

    render(editPointComponent, pointListContainer, RenderPosition.AFTERBEGIN);
    render(createPointComponent, pointListContainer);

    points.forEach((point) =>
      render(
        new PointView({ point, destinationsById, offersById }),
        pointListContainer,
      ),
    );
  }
}
