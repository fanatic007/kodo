import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  constructor(private http: HttpClient) {}

  getData(searchQuery?):Observable<any>{
    let params;
    if(searchQuery){
      params = new HttpParams().set("searchQuery",searchQuery);
    }
    return this.http.get(environment.browseEndPointUrl,{observe:'response',params:params});
  }

  sortData(data:any[], sortBy){
    let stringComp = (a,b) => { return a[sortBy].toLowerCase() > b[sortBy].toLowerCase()?1:-1;};
    let dateComp = (a,b) => { return +new Date(a[sortBy]) - +new Date(b[sortBy]) };
    let comparator = sortBy==='dateLastEdited'? dateComp: stringComp;
    let result = data.sort(comparator);
    return result;
  }

  getPage(data:any[],paginationConfig){
    let start = (paginationConfig.pageNumber -1) * paginationConfig.pageSize;
    return data.slice(start ,start + paginationConfig.pageSize);
  }
}


export interface PaginationConfig{
  pageNumber : number,
  pageSize : number
}