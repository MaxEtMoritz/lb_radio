import bs, { Modal } from 'bootstrap';
import JSONLocalStorage from './jsonLocalStorage.js';
import * as pageElements from './pageElements.js';
import ListenbrainzAPI from './lb_api.js';

pageElements.modal.addEventListener('show.bs.modal', e => {
  console.log('show');

  pageElements.lb_token.value = JSONLocalStorage.lb_account?.token ?? '';
  pageElements.lb_token.setCustomValidity('');

  pageElements.regex.value = JSONLocalStorage.regex;
  pageElements.regex.setCustomValidity('');

  pageElements.poll_interval.value = JSONLocalStorage.poll_interval;
  pageElements.slider_value.innerText = pageElements.poll_interval.valueAsNumber;

  pageElements.regex101.href = `https://regex101.com/?flavor=javascript&regex=${encodeURIComponent(pageElements.regex.value)}&flags=`;

  pageElements.settings_form.classList.remove('was-validated');
});

window.saveSettings = async function () {
  let currentUserInfo = JSONLocalStorage.lb_account ?? {};
  let tokenInput = pageElements.lb_token;
  let ls_update = {};
  if (currentUserInfo.token != tokenInput.value) {
    let res = await ListenbrainzAPI.validateToken(tokenInput.value);
    if (res.valid) {
      tokenInput.setCustomValidity('');
      ls_update['lb_account'] = { token: tokenInput.value, userName: res.user_name };
    } else {
      tokenInput.setCustomValidity('the token is invalid.');
    }
  }

  let currentRegex = JSONLocalStorage.regex;
  let regexInput = pageElements.regex;
  if (currentRegex != regexInput.value) {
    let t_re = /\(\?<title>.*?\)/g;
    let a_re = /\(\?<artist>.*?\)/g;
    if (!throws(v => new RegExp(v), regexInput.value) && t_re.exec(regexInput.value) && a_re.exec(regexInput.value)) {
      regexInput.setCustomValidity('');
      ls_update['regex'] = regexInput.value;
    } else if (throws(v => new RegExp(v), regexInput.value)) {
      try {
        new RegExp(regexInput.value);
      } catch (e) {
        regexInput.setCustomValidity(e.message);
      }
    } else {
      regexInput.setCustomValidity('Input must contain the named capturing groups "artist" and "title".');
    }
  }

  let currentPollInterval = JSONLocalStorage.poll_interval;
  if (currentPollInterval != pageElements.poll_interval.valueAsNumber) {
    ls_update['poll_interval'] = pageElements.poll_interval.valueAsNumber;
  }

  pageElements.settings_form.classList.add('was-validated');
  if (pageElements.settings_form.reportValidity()) {
    for (const [k, v] of Object.entries(ls_update)) {
      JSONLocalStorage[k] = v;
    }
    console.debug(Modal);
    console.debug(Modal.getOrCreateInstance('#modal'));
    Modal.getOrCreateInstance('#modal').hide();
  }
};