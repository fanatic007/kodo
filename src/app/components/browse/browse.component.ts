import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataService, PaginationConfig } from '../../services/data.service';
import { ActivatedRoute, Router, Params, RouterEvent, NavigationEnd } from '@angular/router';
import { fromEvent, Observable, pipe, Subscription } from 'rxjs/';
import { debounce, debounceTime, filter, throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements  OnInit, AfterViewInit, OnDestroy {
  dataReceived = true;
  data=[];
  currentView=[];
  searchParamObservable : Observable<Params> = this.route.queryParams;
  sortOptions = [{label:'Name', value:'name'},{label:'Date Last Edited', value:'dateLastEdited'}];
  sortBy = 'name';
  searchQuery = '';
  @ViewChild('search') search:ElementRef;
  @ViewChild('sort') sort:ElementRef;
  searchSubscription : Subscription;
  sortSubscription : Subscription;
  paginationConfig : PaginationConfig= {
    pageSize : 6,
    pageNumber: 1
  };
  pages = [];
  queryParams = {};
 
  constructor(private dataService:DataService, private route: ActivatedRoute, private router:Router){
  }

  ngOnInit(): void {
    if(!this.router.url.includes("sortBy=")){
      this.queryParams['sortBy'] = this.sortBy;
    }
    if(!this.router.url.includes("page=")){
      this.queryParams['page'] = this.paginationConfig.pageNumber;
    }
    this.searchParamObservable.subscribe((res)=>{
      this.paginationConfig.pageNumber =  res['page']? res['page']:this.paginationConfig.pageNumber;
      this.sortBy =  res['sortBy']? res['sortBy']:this.sortBy;
      let newData = false;
      if(res['searchQuery']){
        newData = true;
        this.searchQuery = res['searchQuery'];
      }
      this.fetchData(newData);
    });
    this.updateState(this.queryParams);
  }

  ngAfterViewInit(): void {
    /* Subsciption to an observable created from 'keyup' event of search box. Observed every with Debounce operator */
    this.searchSubscription = fromEvent(this.search.nativeElement, 'keyup').pipe(debounceTime(500)).subscribe((event)=>{
      console.log(<any>(<any>event).keyCode,this.search.nativeElement.value.trim().length);
      if(this.search.nativeElement.value.trim().length===0){
        this.searchQuery = "";
        this.fetchData(true);
        this.updateState({searchQuery:undefined})
      }
      else{
        this.updateState({searchQuery:this.search.nativeElement.value.trim()});
      }
    });
    /* Subsciption to an observable created from 'change' event of sort option */
    this.sortSubscription = fromEvent(this.sort.nativeElement,'change').subscribe((event)=>{
      this.updateState({sortBy: (<any>(<any>event)).target.value });
    });
    this.search.nativeElement.focus();
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.sortSubscription.unsubscribe();
  }  

  fetchData(newData){
    if(newData || this.data.length===0){
      this.dataReceived = false;
      this.data = [];
      this.dataService.getData(this.searchQuery.trim()).subscribe(
        (res)=>{
          this.data = res.body;
          this.pages = Array.from(Array( Math.round(this.data.length/this.paginationConfig.pageSize) ).keys());
          this.sortData();
          this.dataReceived = true;
        },
        (err)=>{ console.log(err);
          this.dataReceived = true; }
      ); 
    }
    else{
      this.pages = Array.from(Array( Math.round(this.data.length/this.paginationConfig.pageSize) ).keys());
      // this.updateState({sortBy:this.sortBy},'fetch');
      this.sortData();
    }
  }
  
  sortData(){
    this.data = this.dataService.sortData(this.data,this.sortBy);
    // this.updateState({page:this.paginationConfig.pageNumber},'sort');
    this.getCurrentView();
  }

  changePage(pageNumber){this.paginationConfig.pageNumber = pageNumber;
    this.updateState({page:this.paginationConfig.pageNumber});
  }
  
  getCurrentView(){
    this.currentView = this.dataService.getPage(this.data,this.paginationConfig);
  }

  updateState(params: Partial<Params>) {
    this.router.navigate(['.'], {
      queryParams:params,
      queryParamsHandling: 'merge'
    })
  }

}
