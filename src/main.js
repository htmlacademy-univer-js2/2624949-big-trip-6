import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import PointsApiService from './points-api-service.js';

const AUTHORIZATION = 'Basic eo0w590ik29889a';
const END_POINT = 'https://21.objects.htmlacademy.pro/big-trip';

const headerElement = document.querySelector('.trip-main');
const filtersContainer = headerElement.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');
const newEventButtonComponent = headerElement.querySelector('.trip-main__event-add-btn');

const pointsModel = new PointsModel({
  pointsApiService: new PointsApiService(END_POINT, AUTHORIZATION)
});
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
pointsModel.init()
  .finally(() => {
    newEventButtonComponent.disabled = false;
  });
