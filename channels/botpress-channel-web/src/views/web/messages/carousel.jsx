import React, { Component } from 'react'

import Slider  from 'react-slick'

import style from './style.scss'

require("slick-carousel/slick/slick.css")
require("slick-carousel/slick/slick-theme.css")

export default class CarouselMessage extends Component {
  constructor(props) {
    super(props)
    this.state = { hover: false }
  }

  render() {


    const CarouselElement = el => {

      return <div className={style['carousel-item']}>
        {el.picture && <div className={style.picture} style={{ backgroundImage: `url("${el.picture}")`}}></div>}
        <div className={style.more}>
          <div className={style.info}>
            <div className={style.title}>{el.title}</div>
            { el.subtitle && <div className={style.subtitle}>{el.subtitle}</div> }
          </div>
          <div className={style.buttons}>
            { el.buttons.map(btn => {
              if (btn.url) {
                return <a href={btn.url} target="_blank" className={style.action}>{btn.title}</a>
              } else {
                return <a href="#" className={style.action}>{'[TODO] ' + btn.title || btn}</a>
              }
            }) }
          </div>
        </div>
      </div>
    }

    const elements = this.props.carousel.elements || []

    const settings = {
      dots: false,
      infinite: false,
      // slidesToShow: 3,
      responsible: [
        { breakpoint: 550, settings: { slidesToShow: 1 } },
        { breakpoint: 1024, settings: { slidesToShow: 2 } },
        { breakpoint: 1548, settings: { slidesToShow: 3 } },
        { breakpoint: 2072, settings: { slidesToShow: 4 } },
        { breakpoint: 10000, settings: 'unslick' }
      ],
      slidesToScroll: 1,
      autoplay: false,
      centerMode: false,
      arrows: elements.length > 1
    }

    return <Slider {...settings}>
      {elements.map(el => CarouselElement(el))}
    </Slider>
  }
}
