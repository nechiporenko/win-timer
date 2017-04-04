(function(){
    'use strict';

    //Отобразим на странице число, которое динамиески будет увеличиваться на случайную величину в случайном интервале
    var win = document.getElementById('wt'); //ID элемента, в котором будет выведено число
    if (win) {
        winTimer(win);
    }

    function winTimer(el) {
        var default_val = 461035, //стартовое значение, которое увидит пользователь при первой загрузке страницы
            minimum_val = 10000, //к этому значению будет сброшено число, когда перевалит максимальное значение
            maximum_val = 950000, //максимальное значение числа
            current = 0, //тут будет хранится текущее значение числа
            min = 0, //минимальное приращение
            max = 1, //максимальное приращение
            min_time = 3000, //мин.временной интервал обновления
            max_time = 20000, //макс.временной интервал обновления
            timer = '', //здесь будет хранится рекурсивный вызов таймера
            time = '', //а здесь - случайный временной интервал
            method = {}; //методы (функции)

        method.init = function () {
            //получим значение числа из localStorage
            current = parseFloat(localStorage.getItem('winValue')); //сразу преобразуем в число
            if (!current) {//если его там нет - установим дефолтное
                method.save(default_val);
            }

            method.show(current); //отобразим на странице

            //рекурсивный setTimeot, в который передадим случайный временной интервал time
            time = method.getRandomTime();
            timer = setTimeout(function tick() {
                method.add();//увеличили значение числа на случайную величину и отобразили на странице
                time = method.getRandomTime();
                timer = setTimeout(tick, time);
            }, time);
        };

        method.save = function (val) {//запишем текущее значение в localStorage
            try {
                saveToStorage();
            } catch (e) {
                if (e == QUOTA_EXCEEDED_ERR) {//если оно переполнено - очистим и запишем повторно
                    localStorage.clear();
                    saveToStorage();
                }
            }

            function saveToStorage() {
                localStorage.setItem('winValue', val);
                current = val;
            }
        };

        method.show = function (val) { //отобразим текущее значение на странице, предварительно преобразовав число в нужный формат
            el.innerHTML = method.numberFormat(val, 2, '.', ',');
        };

        method.add = function () {//увеличим значение числа на случайную величину
            // будем брать значение из localStorage а не из переменной, т.к. страница может быть открыта в двух вкладках (например) и это позволит частично их синхронизировать
            current = parseFloat(localStorage.getItem('winValue')) + Math.round((Math.random() * (max - min) + min) * 100) / 100; //увеличим на случайное число, округленное до 2 знаков после запятой
            if (current > maximum_val) {//если перевалили за максимум - сбросим к минимуму
                current = minimum_val;
            }
            method.save(current); //сохранили в localStorage
            method.show(current); //вывели на экран
        };


        method.getRandomTime = function () {//вернем случайный целый интервал от 200 до 8000 милисекунд
            return Math.floor(Math.random() * (max_time - min_time + 1)) + min_time;
        };

        // преобразуем число в нужный формат
        // number - число
        // decimal - число знаков после разделителя
        // dec_point - символ разделителя
        // thousand_sep - разделитель тысячных
        method.numberFormat = function (number, decimals, dec_point, thousands_sep) {
            number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
            var n = !isFinite(+number) ? 0 : +number,
              prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
              sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
              dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
              s = '',
              toFixedFix = function (n, prec) {
                  var k = Math.pow(10, prec);
                  return '' + (Math.round(n * k) / k)
                    .toFixed(prec);
              };
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
              .split('.');
            if (s[0].length > 3) {
                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
            }
            if ((s[1] || '')
              .length < prec) {
                s[1] = s[1] || '';
                s[1] += new Array(prec - s[1].length + 1)
                  .join('0');
            }
            return s.join(dec);
        };

        method.init();
    }

})();