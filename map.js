'use strict';

var PIN_WIDTH = 40;
var PIN_HEIGHT = 40;

var OFFERS_COUNT = 8;

var OFFER_TITLES = [
  'Большая уютная квартира',
  'Маленькая неуютная квартира',
  'Огромный прекрасный дворец',
  'Маленький ужасный дворец',
  'Красивый гостевой домик',
  'Некрасивый негостеприимный домик',
  'Уютное бунгало далеко от моря',
  'Неуютное бунгало по колено в воде'
];

var TYPES = [
  'flat',
  'house',
  'bungalo'
];

var CHECK_TIME = [
  '12:00',
  '13:00',
  '14:00'
];

var PHOTOS_ARRAY = [
  'http://o0.github.io/assets/images/tokyo/hotel1.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel2.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
];

var FEATURES_ARRAY = [
  'wifi',
  'dishwasher',
  'parking',
  'washer',
  'elevator',
  'conditioner'
];

// Для неповторяющихся значений в случайном порядке
var compareRandom = function () {
  return Math.random() - 0.5;
};

// Для генерации случайных значений в заданном диапазоне
var getRandomFromTo = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

var getAvatar = function (num) {
  return 'img/avatars/user0' + (num + 1) + '.png';
};

var getPhotos = function () {
  return PHOTOS_ARRAY.sort(compareRandom);
};

var getFeatures = function () {
  FEATURES_ARRAY.sort(compareRandom);
  return FEATURES_ARRAY.slice(0, getRandomFromTo(1, FEATURES_ARRAY.length));
};

// Активирует форму и карту после события mouseup на пине
var activateForm = function () {
  var noticeForm = document.querySelector('.notice__form');
  var fieldArray = noticeForm.querySelectorAll('fieldset');
  var mainPin = document.querySelector('.map__pin--main');
  for (var i = 0; i < fieldArray.length; i++) {
    fieldArray[i].setAttribute('disabled', 'disabled');
  }
  var setMainPinAddress = function () {
    var startX = PIN_HEIGHT / 2;
    var startY = PIN_WIDTH / 2;
    var noticeAddress = document.querySelector('#address');
    noticeAddress.value = startX + ', ' + startY;
  };

  var buttonMouseupHandler = function () {
    document.querySelector('.map').classList.remove('map--faded');
    noticeForm.classList.remove('notice__form--disabled');
    for (i = 0; i < fieldArray.length; i++) {
      fieldArray[i].removeAttribute('disabled');
    }
    setMainPinAddress();
    setupPins();
    mainPin.removeEventListener('mouseup', buttonMouseupHandler);
  };
  mainPin.addEventListener('mouseup', buttonMouseupHandler);
};

activateForm();

var generateOffers = function () {
  var offers = [];
  OFFER_TITLES.sort(compareRandom); // Для неповторяющихся заголовков в рандомном порядке
  for (var i = 0; i < OFFERS_COUNT; i++) {
    var locX = getRandomFromTo(300, 900);
    var locY = getRandomFromTo(150, 500);
    offers.push({
      author: {
        avatar: getAvatar(i)
      },
      offer: {
        title: OFFER_TITLES[i],
        address: locX + ', ' + locY,
        price: getRandomFromTo(1000, 1000000),
        type: TYPES[getRandomFromTo(0, 2)],
        rooms: getRandomFromTo(1, 5),
        guests: getRandomFromTo(1, 10),
        checkin: CHECK_TIME[getRandomFromTo(0, 2)],
        checkout: CHECK_TIME[getRandomFromTo(0, 2)],
        features: getFeatures(),
        description: '',
        photos: getPhotos()
      },
      location: {
        x: locX,
        y: locY
      }
    });
  }
  return offers;
};

var renderNotices = function (renderingOffer) {
  var pinTemplate = document.querySelector('template').content;
  var pinElement = pinTemplate.cloneNode(true);
  var pinIcon = pinElement.querySelector('.map__pin');
  // Отрисовка пинов
  pinIcon.querySelector('img').src = renderingOffer.author.avatar;
  pinIcon.style.left = (renderingOffer.location.x + PIN_WIDTH / 2) + 'px';
  pinIcon.style.top = (renderingOffer.location.y + PIN_HEIGHT) + 'px';
  // Обработчик клика по пину
  var pinIconClickHandler = function (evt) {
	
	var targetPin = evt.target;
    var noticeImg = targetPin.src;
    var offersArray = generateOffers();
    noticeImg.toString();
    var num = (noticeImg[noticeImg.length - 5]) - 1;
	console.log(offersArray[num]);
	var fragment = document.createDocumentFragment();
    var similarListElement = document.querySelector('.map__pins');
	//similarListElement.removeChild(document.querySelector('.map__card'));
	fragment.appendChild(renderPopup(offersArray[num]));
	similarListElement.appendChild(fragment);	
  };
  
  pinIcon.querySelector('img').addEventListener('click', pinIconClickHandler);
  return pinElement;
};

var renderPopup = function (renderingOffer) {
  var pinTemplate = document.querySelector('template').content;
  var pinTemp = pinTemplate.cloneNode(true);
  var pinElement = pinTemp.querySelector('.map__card'); 
  // Отрисовка попап объявлений
  pinElement.querySelector('.popup__avatar').src = renderingOffer.author.avatar;
  pinElement.querySelector('h3').textContent = renderingOffer.offer.title;
  pinElement.querySelector('small').textContent = renderingOffer.offer.address;
  pinElement.querySelector('.popup__price').textContent = renderingOffer.offer.price + ' \u20bd/ночь';
  var getRuType = function (type) {
    if (type === 'flat') {
      return 'Квартира';
    }
    if (type === 'bungalo') {
      return 'Бунгало';
    }
    return 'Дом';
  };
  pinElement.querySelector('h4').textContent = getRuType(renderingOffer.offer.type);
  var elemStr = renderingOffer.offer.rooms + ' комнаты для ' + renderingOffer.offer.guests + ' гостей';
  pinElement.querySelectorAll('p')[2].textContent = elemStr;
  elemStr = 'Заезд после ' + renderingOffer.offer.checkin + ', выезд до ' + renderingOffer.offer.checkout;
  pinElement.querySelectorAll('p')[3].textContent = elemStr;
  var featuresElement = pinElement.querySelector('.popup__features');
  featuresElement.innerHTML = '';
  for (var m = 0; m < renderingOffer.offer.features.length; m++) {
    elemStr = '<li class="feature feature--' + renderingOffer.offer.features[m] + '"></li>';
    featuresElement.insertAdjacentHTML('afterbegin', elemStr);
  }
  pinElement.querySelectorAll('p')[4].textContent = renderingOffer.offer.description;
  var photosElement = pinElement.querySelector('.popup__pictures');
  photosElement.innerHTML = '';
  for (m = 0; m < renderingOffer.offer.photos.length; m++) {
    elemStr = '<li><img src="' + renderingOffer.offer.photos[m] + '" width="70" height="70" ></li>';
    photosElement.insertAdjacentHTML('afterbegin', elemStr);
  }
  
  return pinElement;
};

var setupPins = function () {
  var offersArray = generateOffers();
  var fragment = document.createDocumentFragment();
  var similarListElement = document.querySelector('.map__pins');
  for (var n = 0; n < offersArray.length; n++) {
    fragment.appendChild(renderNotices(offersArray[n]));
  }
  similarListElement.appendChild(fragment);
};



