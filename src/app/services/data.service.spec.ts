import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule]
    });
    service = TestBed.inject(DataService);
  });

  it('should get correct page data', () => {
    let paginationConfig = { pageNumber : 1, pageSize: 5};
    let dummyData =Array.from(Array( Math.round(500/paginationConfig.pageSize) ).keys());console.log(dummyData);    
    expect(service.getPage(dummyData,paginationConfig).length).toBe(paginationConfig.pageSize); // checkn size of returned data 
    expect(service.getPage(dummyData,paginationConfig)[0]).toBe(dummyData[(paginationConfig.pageNumber-1) * paginationConfig.pageSize]); // check first element of returned data 
  });

  it('should get sort data correctly', () => {
    let paginationConfig = { pageNumber : 1, pageSize: 5};
    let dummyData =  [{
      "name": "C",
      "dateLastEdited": "2018-05-19T12:33:25.545Z"
    },{
      "name": "D",
      "dateLastEdited": "2017-11-28T04:59:13.759Z"
    }];
    expect(service.sortData(dummyData,'name')[0].name ).toBe('C'); // compare name
    expect(service.sortData(dummyData,'dateLastEdited')[0].dateLastEdited).toBe("2017-11-28T04:59:13.759Z"); // compare date 
  });

});
