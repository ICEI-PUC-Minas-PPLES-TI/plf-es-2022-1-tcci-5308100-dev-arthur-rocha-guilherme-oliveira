# Slide Topics

## Start project

```sh
npm install -g @angular/cli
ng new angular-kt
```

Ou

```sh
npx -p @angular/cli ng new angular-kt
```

---

## Módulos

```sh
ng generate module module-name
```

```ts
@NgModule({
  declarations: [], //Componentes, Diretivas e Pipes que pertecem a esse módulo.
  exports: [], //Subconjunto das declarações que dita quais serão os componentes que poderão ser acessados externamente para quem importar esse módulo.
  imports: [], // Conjunto de módulos que exportam Components que poderão ser utilizados no escopo desse módulo.
  providers: [], //Declaração de serviços do módulo que serão utilizados no escopo desse módulo.
  bootstrap: [], //Específica qual o primeiro componente que será executado na aplicação.
})
```

---

## Componentes

```sh
ng generate component component-name
```

```ts
@Component({
  selector: "", //Seletor 'CSS' que dirá ao angular quando criar uma instância do componente em html de componentes pais.
  templateUrl: "", //String que recebe o caminho para o arquivo que contém o template html do componente.
  stylesUrls: ['' ], //Caminhos que se encontra os arquivos de estilo do componente.
})
```

### Data binding

- Property binding
  - [prop]
  - {{ prop }}
- Event binding
  - (event)
- Two-way-bind
  - [(two-way-bind)]
  
---

## Services

```sh
ng generate service service-name
```

```ts
@Injectable({
  providedIn: 'root', //Define o escopo da visibilidade da instância criada.
})
```

---

## Diretivas

## Principais diretivas do angular

- *ngIf="condition"
- *ngFor="let item of list"

```sh
ng generate directive directive-name
```

```ts
@Directive({
  selector: '[appDirectiveName]', //O identificador da diretiva utilizado no template do component.
})
```

---

## Pipes

### Exemplos de pipes nativos

- translate
- DecimalPipe (number)
- DatePipe (date)
- PercentPipe (percent)
- UpperCasePipe (uppercase)

```sh
ng generate pipe pipe-name
```

```ts
@Pipe({
  name: 'pipeName', //O identificador do pipe utilizado no template do component.
})
```
