import { TestBed } from "@angular/core/testing";
import { BibService } from "./bib.service";
import { PublicationType, IBib } from "./IBib";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting, HttpTestingController } from "@angular/common/http/testing";

describe('BibService', () => {
    let service: BibService;
    let httpMock: HttpTestingController;
    let bib: IBib = {
        id: 1,
        publicationType: PublicationType.UNDEFINED,
        authors: "",
        editors: "",
        translators: "",
        title: "",
        url: "",
        bookEditors: "",
        book: "",
        bookSeries: "",
        volume: "",
        numOfVolumes: "",
        placeOfPublication: "",
        publisher: "",
        publicationYear: "",
        pageNumbers: "",
        sagaIds: [],
        recommended: false,
        description: ""
    };

    let bibs: IBib[] = [bib];

    const getUrl = '/api/bibentries/getbibentries';
    const getByIdUrl = '/api/bibentries/getbibentrybyid/1';
    const postUrl = '/api/bibentries/postbibentry';
    const putUrl = '/api/bibentries/putbibentry';
    const deleteUrl = '/api/bibentries/deletebibentry/1';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(BibService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('service should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getBibEntries should return data', () => {
        service.getBibEntries().subscribe(result => {
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThanOrEqual(1);
        });

        const req = httpMock.expectOne(getUrl);
        expect(req.request.method).toBe('GET');

        req.flush(bibs);
    });

    it('getBibById should return data', () => {
        service.getBibEntryById(1).subscribe(result => {
            expect(result).toBeTruthy();
            expect(result.publicationType).toBe(PublicationType.UNDEFINED);
        });

        const req = httpMock.expectOne(getByIdUrl);
        expect(req.request.method).toBe('GET');

        req.flush(bib);
    });

    it('postBib should post and return data', () => {
        service.postBib(bib).subscribe(result => {
            expect(result).toBeTruthy();
        });

        const req = httpMock.expectOne(postUrl);
        expect(req.request.method).toBe('POST');

        req.flush(bib);
    });

    it('putBib should put and return data', () => {
        service.putBib(bib).subscribe(result => {
            expect(result).toBeTruthy();
        });

        const req = httpMock.expectOne(putUrl);
        expect(req.request.method).toBe('PUT');

        req.flush(bib);
    });

    it('deleteBib should delete and return data', () => {
        service.deleteBib(1).subscribe(result => {
            expect(result).toBeTruthy();
        });

        const req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');

        req.flush(bib);
    });
});