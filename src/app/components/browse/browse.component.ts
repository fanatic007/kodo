import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataService, PaginationConfig } from '../../services/data.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { fromEvent, Observable, pipe, Subscription } from 'rxjs/';
import { switchMap, throttleTime } from 'rxjs/operators';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements  OnInit, AfterViewInit, OnDestroy {
  dataReceived = false;
  data=[];
  currentView=[];
  searchParamObservable : Observable<Params> = this.route.queryParams;
  sortOptions = [{label:'Name', value:'name'},{label:'Date Last Edited', value:'dateLastEdited'}];
  sortBy = 'Title';
  searchQuery = '';
  @ViewChild('search') search:ElementRef;
  @ViewChild('sort') sort:ElementRef;
  searchSubscription : Subscription;
  sortSubscription : Subscription;
  paginationConfig : PaginationConfig= {
    pageSize : 6,
    pageNumber: 0
  }
  pages = [];
  
  constructor(private dataService:DataService, private route: ActivatedRoute, private router:Router){
  }

  ngOnInit(): void {
    this.dataReceived = false;
    this.fetchData();
    this.searchParamObservable.subscribe((res)=>{
      res['searchQuery'] ?(this.searchQuery = res['searchQuery'], this.fetchData()):null;
      res['sortBy'] ? (this.sortBy = res['sortBy'], this.sortData()):null;
      res['page'] ? (this.paginationConfig.pageNumber = res['page'], this.getCurrentView()):null;
    });
  }

  ngAfterViewInit(): void {
    /* Subsciption to an observable created from 'keyup' event of search box. Observed every 500ms using throttleTime operator */
    this.searchSubscription = fromEvent(this.search.nativeElement, 'keyup').pipe( throttleTime(500) ).subscribe((event)=>{ 
      this.searchQuery = ((<any>event).target).value;
      this.updateState({searchQuery:this.searchQuery});
    });
    /* Subsciption to an observable created from 'change' event of sort option */
    this.sortSubscription = fromEvent(this.sort.nativeElement, 'change').subscribe((event)=>{ 
      this.sortBy = ((<any>event).target).value;
      this.updateState({sortBy:this.sortBy});
    });

  }  

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.sortSubscription.unsubscribe();
  }  

  fetchData(){
    this.dataReceived = false;
    this.data = [];
    this.dataService.getData(this.searchQuery.trim()).subscribe(
      (res)=>{
        this.data = res.body;
        this.pages = Array.from(Array( Math.round(this.data.length/this.paginationConfig.pageSize) + 1 ).keys());
        this.sortData();
        this.dataReceived = true;
      },
      (err)=>{ console.log(err);
        this.dataReceived = true; }
    );
  }
  
  sortData(){
    this.data = this.dataService.sortData(this.data,this.sortBy);
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
