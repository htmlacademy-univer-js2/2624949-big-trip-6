import TripPresenter from './presenter/trip-presenter';
import FilterPresenter from './presenter/filter-presenter';
import PointsModel from './model/points-model';
import FilterModel from './model/filter-model';

const headerElement = document.querySelector('.trip-main');
const filtersContainer = headerElement.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');
const newEventButtonComponent = headerElement.querySelector('.trip-main__event-add-btn');

const pointsModel = new PointsModel();
const filterModel = new FilterModel();

const handleNewEventFormClose = () => {
  newEventButtonComponent.disabled = false;
};

const tripPresenter = new TripPresenter({
  tripEventsContainer,
  pointsModel,
  filterModel,
  onNewPointDestroy: handleNewEventFormClose
});

const filterPresenter = new FilterPresenter({
  filterContainer: filtersContainer,
  filterModel,
  pointsModel
});

newEventButtonComponent.addEventListener('click', (evt) => {
  evt.preventDefault();
  tripPresenter.createPoint();
  newEventButtonComponent.disabled = true;
});

filterPresenter.init();
tripPresenter.init();
