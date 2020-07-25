import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormControlName, FormBuilder, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import scrollIntoView from 'scroll-into-view';
import ApiConfig from '../assets/api.config.json';

const CACHE_STATUS = 'CACHE_STATUS';
const CACHED_FORM_DATA = 'CACHED_FORM_DATA';
const CACHED_RESULT = 'CACHED_RESULT';

interface Result {
  displayValues: number[];
  graphValues: number[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  
  submitted: boolean;
  calculating: boolean;
  calculated: boolean;
  errorMsg: string;
  errorMsgTimerId;

  cacheStatus: FormControl;
  dataInputForm: FormGroup;
  result: Result;
  
  @ViewChildren(FormControlName, {read: ElementRef})
  controlRefs: QueryList<ElementRef<HTMLInputElement>>

  constructor(
    private fb: FormBuilder,
    private http: HttpClient) {}

  ngOnInit() {
    this.calculating = false;
    this.calculated = false;
    this.submitted = false;

    const previousCacheStatus = JSON.parse(sessionStorage.getItem(CACHE_STATUS));
    this.cacheStatus = this.fb.control(previousCacheStatus ?? true);

    this.dataInputForm = this.fb.group({
      input_1: [, Validators.required],
      input_2: [, Validators.required],
      input_3: [, Validators.required],
      input_4: [, Validators.required],
      input_5: [, Validators.required],
      input_6: [, Validators.required],
      input_7: [, Validators.required],
      input_8: [, Validators.required],
      input_9: [, Validators.required],
      input_10: [, Validators.required],
      input_11: [, Validators.required],
    });


    if (this.cacheStatus.value) {
      const cachedFormData = JSON.parse(sessionStorage.getItem(CACHED_FORM_DATA));
      const cachedResult = JSON.parse(sessionStorage.getItem(CACHED_RESULT));
      if (cachedFormData) {
        this.dataInputForm.setValue(cachedFormData)
      }
      if (cachedResult) {
        this.result = cachedResult;
        this.calculated = true;
      }
    }

    this.cacheStatus.valueChanges
    .subscribe(value => {

      sessionStorage.setItem(CACHE_STATUS, value)
      if (value) {
        sessionStorage.setItem(CACHED_FORM_DATA, JSON.stringify(this.dataInputForm.value));
        sessionStorage.setItem(CACHED_RESULT, JSON.stringify(this.result) || null);
      } else {
        sessionStorage.removeItem(CACHED_FORM_DATA);
        sessionStorage.removeItem(CACHED_RESULT);
      }
    });

    this.dataInputForm.valueChanges
    .pipe(debounceTime(300))
    .subscribe(value => {

      if (this.cacheStatus.value) {
        sessionStorage.setItem(CACHED_FORM_DATA, JSON.stringify(value));
      }
    });

  }

  calculate() {
    this.submitted = true;
    this.errorMsg = null;
    clearTimeout(this.errorMsgTimerId);

    if (this.dataInputForm.invalid) {
      this.goToFirstInvalidControl();
      return;
    }

    this.calculating = true;
    
    this.http.post<Result>(ApiConfig.base_url + 'calculate', this.dataInputForm.value)
    .subscribe(result => {
      this.result = result;
      this.calculating = false;
      this.calculated = true;
      if (this.cacheStatus.value) {
        sessionStorage.setItem(CACHED_RESULT, JSON.stringify(result));
      }
    }, () => {
      this.calculating = false;
      this.errorMsg = 'Something went wrong, Try again';
      this.errorMsgTimerId = setTimeout(() => {
        this.errorMsg = null;
      }, 4000);
    })
    
  }

  goToFirstInvalidControl() {
    const firstInvalidControlIndex = Object.values(this.dataInputForm.controls)
    .findIndex(control => control.invalid);

    const firstInvalidControlElement = this.controlRefs
    .toArray()[firstInvalidControlIndex]
    .nativeElement

    scrollIntoView(firstInvalidControlElement, {
      align: {
        top: 0,
        topOffset: 25,
      }
    }, () => {
      firstInvalidControlElement.focus();
    })
  }

  goToGraph(graphRef: HTMLCanvasElement) {
    if (this.submitted) {
      scrollIntoView(graphRef, {
        align: {
          top: 1,
          topOffset: -15,
        }
      });
    }
  }

  resetForm() {
    this.submitted = false;
    this.dataInputForm.reset();
  }
  

}
